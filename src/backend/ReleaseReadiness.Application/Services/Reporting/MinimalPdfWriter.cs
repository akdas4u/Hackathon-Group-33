using System.Globalization;
using System.Text;
using ReleaseReadiness.Application.DTOs;
using ReleaseReadiness.Domain.Enums;

namespace ReleaseReadiness.Application.Services.Reporting;

/// <summary>
/// Hand-rolled, multi-page PDF writer producing a fully valid PDF byte stream (correct
/// object offsets, xref table, and trailer) with real color and section styling that
/// mirrors the web UI's design tokens. Deliberately avoids a third-party PDF library so
/// the demo has no runtime license configuration to trip over and stays fast enough to
/// run inline on every request. Paginates automatically — nothing is silently truncated
/// once content exceeds one page.
/// </summary>
internal static class MinimalPdfWriter
{
    private const double PageWidth = 612;
    private const double PageHeight = 792;
    private const double LeftMargin = 50;
    private const double RightMargin = 50;
    private const double TopMargin = 792 - 50;
    private const double BottomMargin = 50;
    private const double ContentWidth = PageWidth - LeftMargin - RightMargin;

    private readonly record struct Rgb(double R, double G, double B)
    {
        public string Op => string.Create(CultureInfo.InvariantCulture, $"{R:F3} {G:F3} {B:F3} rg");
    }

    private static readonly Rgb BrandBlack = new(0.020, 0.157, 0.192);
    private static readonly Rgb White = new(1, 1, 1);
    private static readonly Rgb TextPrimary = new(0.020, 0.157, 0.192);
    private static readonly Rgb TextMuted = new(0.561, 0.639, 0.671);
    private static readonly Rgb BorderDefault = new(0.867, 0.894, 0.906);
    private static readonly Rgb Success = new(0.118, 0.541, 0.298);
    private static readonly Rgb SuccessBg = new(0.910, 0.969, 0.933);
    private static readonly Rgb Warning = new(0.706, 0.325, 0.035);
    private static readonly Rgb WarningBg = new(0.996, 0.953, 0.886);
    private static readonly Rgb Danger = new(0.753, 0.224, 0.169);
    private static readonly Rgb DangerBg = new(0.992, 0.925, 0.918);
    private static readonly Rgb BrandTeal = new(0.0, 0.776, 0.761);

    private sealed class Page
    {
        public readonly StringBuilder Content = new();
        public double CursorY;
    }

    private sealed class Renderer
    {
        private readonly List<Page> _pages = new();
        private readonly string _releaseId;
        private int _pageNumber;

        public Renderer(string releaseId)
        {
            _releaseId = releaseId;
            NewPage(isFirstPage: true);
        }

        public IReadOnlyList<Page> Pages => _pages;

        private Page Current => _pages[^1];

        private void NewPage(bool isFirstPage)
        {
            _pageNumber++;
            var page = new Page { CursorY = TopMargin };
            _pages.Add(page);
            if (!isFirstPage)
            {
                DrawText(LeftMargin, page.CursorY, 8, $"Release Readiness Report - Release {_releaseId} (continued)", TextMuted);
                page.CursorY -= 20;
            }
        }

        public void EnsureSpace(double neededHeight)
        {
            if (Current.CursorY - neededHeight < BottomMargin)
            {
                DrawFooter();
                NewPage(isFirstPage: false);
            }
        }

        private void DrawFooter()
        {
            DrawText(PageWidth - RightMargin - 60, BottomMargin - 20, 8, $"Page {_pageNumber}", TextMuted);
        }

        public void FinishLastPage() => DrawFooter();

        public void FillRect(double x, double y, double w, double h, Rgb color)
        {
            var sb = Current.Content;
            sb.Append(color.Op).Append('\n');
            sb.Append(FormatNum(x)).Append(' ').Append(FormatNum(y)).Append(' ')
              .Append(FormatNum(w)).Append(' ').Append(FormatNum(h)).Append(" re f\n");
        }

        public void DrawText(double x, double y, double size, string text, Rgb color, bool bold = false)
        {
            string font = bold ? "/F2" : "/F1";
            var sb = Current.Content;
            sb.Append(color.Op).Append('\n');
            sb.Append("BT ").Append(font).Append(' ').Append(FormatNum(size)).Append(" Tf ")
              .Append(FormatNum(x)).Append(' ').Append(FormatNum(y)).Append(" Td (")
              .Append(Escape(text)).Append(") Tj ET\n");
        }

        /// <summary>Draws wrapped body text starting at the current cursor, advancing it. Returns the height consumed.</summary>
        public double DrawWrapped(double x, double width, double size, double lineHeight, string text, Rgb color, bool bold = false)
        {
            var lines = Wrap(text, MaxCharsForWidth(width, size)).ToList();
            EnsureSpace(lines.Count * lineHeight);
            double consumed = 0;
            foreach (var line in lines)
            {
                DrawText(x, Current.CursorY, size, line, color, bold);
                Current.CursorY -= lineHeight;
                consumed += lineHeight;
            }
            return consumed;
        }

        public void AdvanceCursor(double amount) => Current.CursorY -= amount;

        public double CursorY => Current.CursorY;

        private static string FormatNum(double value) => value.ToString("F2", CultureInfo.InvariantCulture);
    }

    public static byte[] WriteReport(ReleaseReadinessResponse response)
    {
        var renderer = new Renderer(response.ReleaseId);
        RenderHeader(renderer, response);
        RenderDecisionBanner(renderer, response);
        RenderExecutiveSummary(renderer, response);
        RenderCriticalIssues(renderer, response);
        RenderStageTable(renderer, response);
        renderer.FinishLastPage();

        return Assemble(renderer.Pages);
    }

    private static void RenderHeader(Renderer r, ReleaseReadinessResponse response)
    {
        r.FillRect(0, PageHeight - 80, PageWidth, 80, BrandBlack);
        r.DrawText(LeftMargin, PageHeight - 40, 18, "Release Readiness Report", White, bold: true);
        r.DrawText(LeftMargin, PageHeight - 60, 9, $"Release {response.ReleaseId}   |   Generated {response.GeneratedAt}", BrandTeal);
        r.DrawText(LeftMargin, PageHeight - 72, 8, $"Correlation ID: {response.CorrelationId}", new Rgb(0.75, 0.85, 0.87));
        r.AdvanceCursor(TopMargin - (PageHeight - 96));
    }

    private static (Rgb Bg, Rgb Fg, string Label) DecisionStyle(DecisionType decision) => decision switch
    {
        DecisionType.Go => (SuccessBg, Success, "GO"),
        DecisionType.GoWithConditions => (WarningBg, Warning, "GO WITH CONDITIONS"),
        DecisionType.NoGo => (DangerBg, Danger, "NO GO"),
        _ => (SuccessBg, Success, decision.ToString()),
    };

    private static void RenderDecisionBanner(Renderer r, ReleaseReadinessResponse response)
    {
        var (bg, fg, label) = DecisionStyle(response.Decision);
        r.EnsureSpace(54);
        double bannerTop = r.CursorY;
        r.FillRect(LeftMargin, bannerTop - 44, ContentWidth, 44, bg);
        r.DrawText(LeftMargin + 16, bannerTop - 18, 9, "RELEASE DECISION", fg, bold: true);
        r.DrawText(LeftMargin + 16, bannerTop - 36, 20, label, fg, bold: true);
        string scoreText = $"Confidence: {Math.Round(response.ConfidenceScore)}%";
        r.DrawText(LeftMargin + ContentWidth - 16 - (scoreText.Length * 6.2), bannerTop - 28, 12, scoreText, fg, bold: true);
        r.AdvanceCursor(44 + 16);
    }

    private static void SectionHeader(Renderer r, string title, Rgb accent)
    {
        r.EnsureSpace(24);
        r.FillRect(LeftMargin, r.CursorY - 2, 4, 14, accent);
        r.DrawText(LeftMargin + 12, r.CursorY, 12, title, TextPrimary, bold: true);
        r.AdvanceCursor(20);
    }

    private static void RenderExecutiveSummary(Renderer r, ReleaseReadinessResponse response)
    {
        SectionHeader(r, "Executive Summary", BrandTeal);
        r.DrawWrapped(LeftMargin, ContentWidth, 10, 14, response.ExecutiveSummary, TextPrimary);
        r.AdvanceCursor(14);
    }

    private static void RenderCriticalIssues(Renderer r, ReleaseReadinessResponse response)
    {
        var critical = response.Stages.Where(s => s.RiskLevel == RiskLevel.Critical).ToList();
        if (critical.Count == 0)
        {
            return;
        }

        SectionHeader(r, $"Critical Issues ({critical.Count})", Danger);

        foreach (var stage in critical)
        {
            r.EnsureSpace(40);
            r.FillRect(LeftMargin - 4, r.CursorY - 3, 3, 13, Danger); // left accent beside the stage name
            r.DrawText(LeftMargin + 6, r.CursorY, 10.5, stage.StageKey, Danger, bold: true);
            r.AdvanceCursor(15);
            r.DrawWrapped(LeftMargin + 6, ContentWidth - 6, 9, 12.5, $"Evidence: {stage.Evidence}", TextPrimary);
            if (!string.IsNullOrWhiteSpace(stage.Remediation))
            {
                r.DrawWrapped(LeftMargin + 6, ContentWidth - 6, 9, 12.5, $"Remediation: {stage.Remediation}", BrandTeal, bold: true);
            }
            r.AdvanceCursor(8);
        }
    }

    private static (Rgb Color, string Label) StatusStyle(StageStatus status) => status switch
    {
        StageStatus.Pass => (Success, "PASS"),
        StageStatus.Fail => (Danger, "FAIL"),
        StageStatus.Unavailable => (TextMuted, "UNAVAILABLE"),
        _ => (TextMuted, status.ToString().ToUpperInvariant()),
    };

    private static (Rgb Color, string Label) RiskStyle(RiskLevel risk) => risk switch
    {
        RiskLevel.Low => (Success, "LOW"),
        RiskLevel.Medium => (Warning, "MEDIUM"),
        RiskLevel.High => (Danger, "HIGH"),
        RiskLevel.Critical => (Danger, "CRITICAL"),
        _ => (TextMuted, risk.ToString().ToUpperInvariant()),
    };

    private static void RenderStageTable(Renderer r, ReleaseReadinessResponse response)
    {
        SectionHeader(r, $"Pipeline Stages ({response.Stages.Count})", BrandTeal);

        const double colStage = LeftMargin;
        const double colStatus = LeftMargin + 150;
        const double colRisk = LeftMargin + 230;
        const double colScore = LeftMargin + 310;

        r.EnsureSpace(16);
        r.DrawText(colStage, r.CursorY, 8, "STAGE", TextMuted, bold: true);
        r.DrawText(colStatus, r.CursorY, 8, "STATUS", TextMuted, bold: true);
        r.DrawText(colRisk, r.CursorY, 8, "RISK", TextMuted, bold: true);
        r.DrawText(colScore, r.CursorY, 8, "SCORE", TextMuted, bold: true);
        r.AdvanceCursor(6);
        r.FillRect(LeftMargin, r.CursorY, ContentWidth, 0.75, BorderDefault);
        r.AdvanceCursor(12);

        foreach (var stage in response.Stages)
        {
            var (statusColor, statusLabel) = StatusStyle(stage.Status);
            var (riskColor, riskLabel) = RiskStyle(stage.RiskLevel);
            bool isCritical = stage.RiskLevel == RiskLevel.Critical;

            r.EnsureSpace(16);
            if (isCritical)
            {
                r.FillRect(LeftMargin - 6, r.CursorY - 3, 3, 14, Danger);
            }
            r.DrawText(colStage, r.CursorY, 9.5, stage.StageKey, TextPrimary, bold: true);
            r.DrawText(colStatus, r.CursorY, 9, statusLabel, statusColor, bold: true);
            r.DrawText(colRisk, r.CursorY, 9, riskLabel, riskColor, bold: true);
            r.DrawText(colScore, r.CursorY, 9, $"{stage.Score}%", TextPrimary);
            r.AdvanceCursor(13);

            r.DrawWrapped(LeftMargin + 8, ContentWidth - 8, 8.5, 11.5, $"Evidence: {stage.Evidence}", TextMuted);
            if (stage.Findings.Count > 0)
            {
                r.DrawWrapped(LeftMargin + 8, ContentWidth - 8, 8.5, 11.5, $"Findings: {string.Join("; ", stage.Findings)}", TextMuted);
            }
            if (!string.IsNullOrWhiteSpace(stage.Remediation))
            {
                r.DrawWrapped(LeftMargin + 8, ContentWidth - 8, 8.5, 11.5, $"Remediation: {stage.Remediation}", BrandTeal);
            }

            r.EnsureSpace(9);
            r.FillRect(LeftMargin, r.CursorY + 4, ContentWidth, 0.5, BorderDefault);
            r.AdvanceCursor(9);
        }
    }

    private static byte[] Assemble(IReadOnlyList<Page> pages)
    {
        int pageCount = pages.Count;
        int fontRegularNum = 3 + (2 * pageCount);
        int fontBoldNum = fontRegularNum + 1;

        var objects = new List<string>();
        objects.Add("<< /Type /Catalog /Pages 2 0 R >>"); // 1
        var kids = string.Join(' ', Enumerable.Range(0, pageCount).Select(i => $"{3 + (2 * i)} 0 R"));
        objects.Add($"<< /Type /Pages /Kids [{kids}] /Count {pageCount} >>"); // 2

        var contentByteLists = new List<byte[]>();
        foreach (var page in pages)
        {
            byte[] contentBytes = Encoding.ASCII.GetBytes(page.Content.ToString());
            contentByteLists.Add(contentBytes);
        }

        for (int i = 0; i < pageCount; i++)
        {
            int contentObjNum = 3 + (2 * i) + 1;
            objects.Add(
                $"<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 {fontRegularNum} 0 R /F2 {fontBoldNum} 0 R >> >> " +
                $"/MediaBox [0 0 {PageWidth} {PageHeight}] /Contents {contentObjNum} 0 R >>");
            objects.Add($"<< /Length {contentByteLists[i].Length} >>\nstream\n{pages[i].Content}\nendstream");
        }

        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"); // fontRegularNum
        objects.Add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"); // fontBoldNum

        var buffer = new StringBuilder();
        buffer.Append("%PDF-1.4\n");

        var offsets = new int[objects.Count + 1];
        for (int i = 0; i < objects.Count; i++)
        {
            offsets[i + 1] = Encoding.ASCII.GetByteCount(buffer.ToString());
            buffer.Append(i + 1).Append(" 0 obj\n").Append(objects[i]).Append("\nendobj\n");
        }

        int xrefOffset = Encoding.ASCII.GetByteCount(buffer.ToString());
        buffer.Append("xref\n0 ").Append(objects.Count + 1).Append('\n');
        buffer.Append("0000000000 65535 f \n");
        for (int i = 1; i <= objects.Count; i++)
        {
            buffer.Append(offsets[i].ToString("D10")).Append(" 00000 n \n");
        }

        buffer.Append("trailer\n<< /Size ").Append(objects.Count + 1).Append(" /Root 1 0 R >>\n");
        buffer.Append("startxref\n").Append(xrefOffset).Append("\n%%EOF");

        return Encoding.ASCII.GetBytes(buffer.ToString());
    }

    /// <summary>
    /// The content stream is written as WinAnsi/ASCII text — anything outside printable
    /// ASCII (e.g. a smart quote or em dash pasted into a fixture from Word) would
    /// otherwise silently become "?" via Encoding.ASCII. Normalize common typographic
    /// characters to their ASCII equivalents first so real report content never renders
    /// as garbage, then fall back to "?" only for genuinely unexpected characters.
    /// </summary>
    private static string Sanitize(string value)
    {
        string normalized = value
            .Replace("…", "...")
            .Replace("‘", "'").Replace("’", "'")
            .Replace("“", "\"").Replace("”", "\"")
            .Replace("–", "-").Replace("—", "-")
            .Replace(" ", " ");

        var sb = new StringBuilder(normalized.Length);
        foreach (char c in normalized)
        {
            sb.Append(c is >= (char)32 and <= (char)126 ? c : '?');
        }
        return sb.ToString();
    }

    private static string Escape(string value) =>
        Sanitize(value).Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");

    private static int MaxCharsForWidth(double widthPts, double fontSize) =>
        Math.Max(10, (int)(widthPts / (fontSize * 0.52)));

    private static IEnumerable<string> Wrap(string line, int maxChars)
    {
        if (string.IsNullOrEmpty(line))
        {
            yield return string.Empty;
            yield break;
        }

        // Word-aware wrap so we don't cut words mid-token.
        var words = line.Split(' ');
        var current = new StringBuilder();
        foreach (var word in words)
        {
            if (current.Length > 0 && current.Length + 1 + word.Length > maxChars)
            {
                yield return current.ToString();
                current.Clear();
            }

            if (word.Length > maxChars)
            {
                if (current.Length > 0)
                {
                    yield return current.ToString();
                    current.Clear();
                }

                for (int i = 0; i < word.Length; i += maxChars)
                {
                    yield return word.Substring(i, Math.Min(maxChars, word.Length - i));
                }
                continue;
            }

            if (current.Length > 0)
            {
                current.Append(' ');
            }
            current.Append(word);
        }

        if (current.Length > 0)
        {
            yield return current.ToString();
        }
    }
}
