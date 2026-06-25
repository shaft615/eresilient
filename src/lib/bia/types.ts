/**
 * Mirror of bia-engine/src/bia_engine/schema.py.
 * Keep in sync when the engine schema changes.
 */

export type DocumentInfo = {
  location_address?: string;
  city_state?: string;
  division?: string;
  department?: string;
  document_owner?: string;
  persons_completing?: string;
  date_completed?: string | null;
  last_updated?: string | null;
};

export type CriticalProcess = {
  process_description: string;
  frequency?: string;
  seasonality?: string;
  quantitative_impact?: string;
  qualitative_impact?: string;
  maximum_disruption?: string;
};

export type InternalDependency = {
  item: string;
  department_function?: string;
  comments?: string;
};

export type ExternalDependency = {
  item: string;
  vendor_customer_other?: string;
  comments?: string;
};

export type SoftwareRequirement = {
  application: string;
  use_description?: string;
  rto?: string;
  rpo?: string;
  manual_workaround?: string;
  comments?: string;
};

export type InfrastructureRequirement = {
  component: string;
  use_description?: string;
  rto?: string;
  corporate_contact?: string;
  vendor_contact?: string;
  mitigation_strategy?: string;
};

export type HumanCapitalRow = {
  functional_role: string;
  normal_headcount?: string;
  day_1?: string;
  day_2_3?: string;
  day_5?: string;
  after_day_10?: string;
  recovery_location?: string;
  key_person_dependencies?: string;
};

export type ThirdPartyRelationship = {
  company_name: string;
  service_provided?: string;
  contact_details?: string;
  recovery_period_instructions?: string;
  mitigation_plan?: string;
};

export type VitalRecord = {
  description: string;
  media_type?: string;
  electronic_backup?: string;
  storage_location?: string;
  vendor_contact?: string;
  restoration_procedures?: string;
};

export type ProcessRecovery = {
  loss_of_site?: string;
  loss_of_systems?: string;
  loss_of_people?: string;
  loss_of_relationship?: string;
};

export type BiaData = {
  title?: string;
  company?: string;
  site_department?: string;
  info?: DocumentInfo;
  critical_processes?: CriticalProcess[];
  upstream_internal?: InternalDependency[];
  upstream_external?: ExternalDependency[];
  downstream_internal?: InternalDependency[];
  downstream_external?: ExternalDependency[];
  software?: SoftwareRequirement[];
  infrastructure?: InfrastructureRequirement[];
  human_capital?: HumanCapitalRow[];
  third_parties?: ThirdPartyRelationship[];
  vital_records?: VitalRecord[];
  process_recovery?: ProcessRecovery;
};

export const EMPTY_BIA: BiaData = {};
