using System.Text;

namespace ReleaseReadiness.Application.Services.Reporting;

/// <summary>
/// Hand-rolled single-page PDF writer producing a minimal but fully valid PDF byte
/// stream (correct object offsets, xref table, and trailer). Deliberately avoids a
/// third-party PDF library so the demo has no runtime license configuration to trip
/// over and stays fast enough to run inline on every request.
/// </summary>
internal static class MinimalPdfWriter
{
    private const int PageWidth = 612;
    private const int PageHeight = 792;
    private const int LeftMargin = 50;
    private const int TopMargin = 740;
    private const int LineHeight = 14;
    private const int MaxCharsPerLine = 95;

    public static byte[] Write(string title, IReadOnlyList<string> bodyLines)
    {
        string contentStream = BuildContentStream(title, bodyLines);
        byte[] contentBytes = Encoding.ASCII.GetBytes(contentStream);

        var objects = new[]
        {
            "<< /Type /Catalog /Pages 2 0 R >>",
            "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            $"<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 {PageWidth} {PageHeight}] /Contents 4 0 R >>",
            $"<< /Length {contentBytes.Length} >>\nstream\n{contentStream}\nendstream",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
        };

        var buffer = new StringBuilder();
        buffer.Append("%PDF-1.4\n");

        var offsets = new int[objects.Length + 1];
        for (int i = 0; i < objects.Length; i++)
        {
            offsets[i + 1] = Encoding.ASCII.GetByteCount(buffer.ToString());
            buffer.Append(i + 1).Append(" 0 obj\n").Append(objects[i]).Append("\nendobj\n");
        }

        int xrefOffset = Encoding.ASCII.GetByteCount(buffer.ToString());
        buffer.Append("xref\n0 ").Append(objects.Length + 1).Append('\n');
        buffer.Append("0000000000 65535 f \n");
        for (int i = 1; i <= objects.Length; i++)
        {
            buffer.Append(offsets[i].ToString("D10")).Append(" 00000 n \n");
        }

        buffer.Append("trailer\n<< /Size ").Append(objects.Length + 1).Append(" /Root 1 0 R >>\n");
        buffer.Append("startxref\n").Append(xrefOffset).Append("\n%%EOF");

        return Encoding.ASCII.GetBytes(buffer.ToString());
    }

    private static string BuildContentStream(string title, IReadOnlyList<string> bodyLines)
    {
        var content = new StringBuilder();
        content.Append("BT\n/F1 14 Tf\n")
            .Append(LeftMargin).Append(' ').Append(TopMargin).Append(" Td\n")
            .Append('(').Append(Escape(title)).Append(") Tj\n")
            .Append("/F1 9 Tf\n0 -").Append(LineHeight * 2).Append(" Td\n");

        bool first = true;
        foreach (var rawLine in bodyLines)
        {
            foreach (var wrapped in Wrap(rawLine))
            {
                if (!first)
                {
                    content.Append("0 -").Append(LineHeight).Append(" Td\n");
                }

                content.Append('(').Append(Escape(wrapped)).Append(") Tj\n");
                first = false;
            }
        }

        content.Append("ET");
        return content.ToString();
    }

    private static string Escape(string value) =>
        value.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");

    private static IEnumerable<string> Wrap(string line)
    {
        if (string.IsNullOrEmpty(line))
        {
            yield return string.Empty;
            yield break;
        }

        for (int i = 0; i < line.Length; i += MaxCharsPerLine)
        {
            yield return line.Substring(i, Math.Min(MaxCharsPerLine, line.Length - i));
        }
    }
}
