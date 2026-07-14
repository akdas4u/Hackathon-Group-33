import { render, screen } from '@testing-library/react';
import { GoNoGoPanel } from '../components/decision/GoNoGoPanel';
import { CriticalIssuesPanel } from '../components/decision/CriticalIssuesPanel';
import { NO_GO_FIXTURE } from './fixtures';

describe('GoNoGoDecision (GoNoGoPanel + CriticalIssuesPanel)', () => {
  it('renders the NO GO decision label with 0% confidence', () => {
    render(
      <GoNoGoPanel
        decision={NO_GO_FIXTURE.decision}
        confidenceScore={NO_GO_FIXTURE.confidenceScore}
      />,
    );

    expect(screen.getByTestId('go-no-go-panel')).toHaveAttribute('data-decision', 'NoGo');
    expect(screen.getByTestId('decision-label')).toHaveTextContent('NO GO');
    expect(screen.getByText(/Confidence score: 0%/)).toBeInTheDocument();
  });

  it('shows exactly the two scripted Critical blockers with evidence and remediation visible', () => {
    render(<CriticalIssuesPanel stages={NO_GO_FIXTURE.stages} />);

    expect(screen.getByTestId('critical-issues-panel')).toBeInTheDocument();
    expect(screen.getByText(/Critical Issues \(2\)/)).toBeInTheDocument();

    // The two scripted blockers per the CONTRACT demo dataset.
    expect(screen.getByTestId('critical-issue-GitHub')).toBeInTheDocument();
    expect(screen.getByTestId('critical-issue-DeploymentConfig')).toBeInTheDocument();

    // Assert against substrings unique to the evidence/remediation fields —
    // "PR #482" and "PAYMENTS_API_KEY" alone also appear in the findings list.
    expect(screen.getByText(/hotfix\/payment-timeout/)).toBeInTheDocument(); // GitHub evidence
    expect(screen.getByText(/appsettings\.Production\.json/)).toBeInTheDocument(); // DeploymentConfig evidence
    expect(screen.getByText(/Merge or explicitly defer PR #482/)).toBeInTheDocument(); // GitHub remediation
    expect(screen.getByText(/Add the missing configuration key/)).toBeInTheDocument(); // DeploymentConfig remediation
  });
});
