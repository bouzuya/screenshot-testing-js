import { Report } from './report';
import { Scenario } from './scenario';

export interface Options {
  path: {
    approved: string;
    captured: string;
    compared: string;
  };
  report: Report;
  scenarios: Scenario[];
}
