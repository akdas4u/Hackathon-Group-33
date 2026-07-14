// Contract-mandated filename "ReleaseAssessmentCard.test.tsx". The scaffold's
// equivalent component is StageCard (components/pipeline/StageCard.tsx),
// which renders one pipeline stage's status/risk — tested here.
import { render, screen } from '@testing-library/react';
import { StageCard } from '../components/pipeline/StageCard';
import { NO_GO_STAGES } from './fixtures';

describe('StageCard (ReleaseAssessmentCard)', () => {
  it('renders a passing stage with Pass status and Low risk badge', () => {
    const jiraStage = NO_GO_STAGES.find((stage) => stage.stageKey === 'Jira');
    if (!jiraStage) {
      throw new Error('fixture missing Jira stage');
    }

    render(<StageCard stage={jiraStage} />);

    expect(screen.getByTestId('stage-card-Jira')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders a critical failing stage with evidence and remediation visible', () => {
    const githubStage = NO_GO_STAGES.find((stage) => stage.stageKey === 'GitHub');
    if (!githubStage) {
      throw new Error('fixture missing GitHub stage');
    }

    render(<StageCard stage={githubStage} />);

    expect(screen.getByTestId('stage-card-GitHub')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    // "PR #482" appears in both the findings list and evidence/remediation
    // text, so assert against substrings unique to each field.
    expect(screen.getByText(/hotfix\/payment-timeout/)).toBeInTheDocument(); // evidence
    expect(screen.getByText(/Merge or explicitly defer/)).toBeInTheDocument(); // remediation
  });
});
