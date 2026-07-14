import { render, screen } from '@testing-library/react';
import { ConfidenceScoreGauge } from '../components/pipeline/ConfidenceScoreGauge';
import { getConfidenceBand } from '../utils/confidence';

describe('ConfidenceScoreGauge', () => {
  it.each<[number, 'red' | 'amber' | 'green']>([
    [0, 'red'],
    [49, 'red'],
    [50, 'amber'],
    [79, 'amber'],
    [80, 'green'],
    [100, 'green'],
  ])('bands a score of %i as %s', (score, expectedBand) => {
    expect(getConfidenceBand(score)).toBe(expectedBand);
  });

  it('renders the rounded percentage and red band for a 0% (NoGo) score', () => {
    render(<ConfidenceScoreGauge score={0} />);
    const value = screen.getByTestId('confidence-score-value');
    expect(value).toHaveTextContent('0%');
    expect(value).toHaveAttribute('data-band', 'red');
  });

  it('renders amber band for a mid-range score', () => {
    render(<ConfidenceScoreGauge score={65} />);
    const value = screen.getByTestId('confidence-score-value');
    expect(value).toHaveTextContent('65%');
    expect(value).toHaveAttribute('data-band', 'amber');
  });

  it('renders green band for a high confidence score', () => {
    render(<ConfidenceScoreGauge score={92} />);
    const value = screen.getByTestId('confidence-score-value');
    expect(value).toHaveTextContent('92%');
    expect(value).toHaveAttribute('data-band', 'green');
  });
});
