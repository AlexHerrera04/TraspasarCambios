// Interfaces principales
export interface IContribution {
  id: string;
  title: string;
  description: string;
  status: 'BORRADOR' | 'COMPLETADO';
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  project_leader: {
    name: string | null;
    area: string | null;
    email: string | null;
  };
  team_members: string | null;
  impacted_areas: string | null;
  business_problem: string | null;
  technical_approach: string | null;
  benefits: Array<{
    benefit: string;
    kpi_metric: string;
    impact: string;
    unit: string;
  }>;
  evidences: Array<{
    competency: string;
    contribution_percentage: string;
    capabilities: string;
  }>;
  evaluators: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  feedback_status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO';
  createdAt: string;
  updatedAt: string;
}

export type ContributionSummary = IContribution;

// Interfaces para evaluación
export interface Benefit {
  benefit: string;
  kpi_metric: string;
  impact: string;
  unit: string;
}

export interface Evidence {
  capacity_name: string;
  contribution_percentage: string;
  content: string;
}

export interface Evaluator {
  id: string;
  name: string;
  lastname: string;
  position: string;
  area: string;
  email: string;
}

export interface EvaluationBenefit {
  name: string;
  impact: string | number;
  agreement: number;
  feedback: string;
}

export interface EvaluationCompetency {
  name: string;
  contribution: string | number;
  agreement: number;
  feedback: string;
}

export interface Evaluation {
  id?: string;
  contributionId: string;
  evaluator: {
    name: string;
    position: string;
    area: string;
  };
  benefits: EvaluationBenefit[];
  competencies: EvaluationCompetency[];
  generalFeedback: string;
  status: string;
  created_at?: string;
}

// Interfaces para formularios
export interface ReviewFormValues {
  evaluators: Array<{
    name: string;
    lastname: string;
    position: string;
    area: string;
    email: string;
  }>;
}

export interface EvaluationFormData {
  benefits: Benefit[];
  competencies: EvaluationCompetency[];
  generalFeedback: string;
}

// Tipos de utilidad
export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ContributionForm {
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  project_leader: {
    name: string;
    area: string;
    email: string;
  };
  team_members: string;
  impacted_areas: string;
  status: 'in_progress' | 'completed' | 'paused';
}

export interface ImpactBenefitsForm {
  business_problem: string;
  technical_approach: string;
  business_benefit: string;
  kpi_metric: string;
  kpi_unit: string;
  kpi_value: string;
}

export interface ContributionEvidenceForm {
  skills: string[];
  highlighted_content: string[];
  contribution_percentage: number;
}
