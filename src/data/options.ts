import { Scenario } from './scenario';

export interface Options {
  path: {
    approved: string;
    captured: string;
    compared: string;
  };
  scenarios: Scenario[];
}
