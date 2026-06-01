/**
 * Simple attribute mapper - applies specific transformation rules
 */
export function mapObjectAttributes(sourceObject: any): any {
  const result: any = {};
  
  // Transform general section - flatten to root level
  if (sourceObject.general) {
    const general = sourceObject.general;
    
    // Direct mappings
    result.project_name = general.title;
    result.description = general.description;
    result.start_date = general.start_date;
    result.estimated_end_date = general.end_date;
    result.team_members = general.team_members;
    result.project_status = general.status;
    result.category = general.category;
    result.impacted_areas = general.impacted_areas;
    
    // Flatten project_leader
    if (general.project_leader) {
      const leader = general.project_leader;
      result.project_leader_name = leader.name;
      result.project_leader_last_name = leader.last_name;
      result.project_leader_area = leader.area;
      result.project_leader_email = leader.email;
    }
  }
  
  // Transform impact section - extract business_benefits and flatten to root
  if (sourceObject.impact) {
    result.business_need = sourceObject.impact.business_problem;
    result.technical_approach = sourceObject.impact.technical_approach;
    
    if (sourceObject.impact.benefits) {
      result.business_benefits = sourceObject.impact.benefits.map((benefit: any) => ({
        benefit: benefit.benefit,
        unit: benefit.unit,
        impact_value: benefit.impact_value,
        metric: benefit.metric,
        business_driver: benefit.business_driver
      }));
    }
  }
  
  // Transform evidence section - flatten evidences to root and rename fields
  if (sourceObject.evidence) {
    // result.skills = sourceObject.evidence.skills;
    // result.highlighted_content = sourceObject.evidence.highlighted_content;
    // result.contribution_percentage = sourceObject.evidence.contribution_percentage;
    
    if (sourceObject.evidence.evidences) {
      result.evidences = sourceObject.evidence.evidences.map((evidence: any) => ({
        capacity: evidence.competency_id,
        contribution_percentage: evidence.contribution_percentage,
        content: evidence.capabilities_id,
      }));
    }
  }
  
  // Transform review section - flatten evaluators to root and rename fields
  if (sourceObject.review && sourceObject.review.evaluators) {
    result.evaluators = sourceObject.review.evaluators.map((evaluator: any) => ({
      first_name: evaluator.name,
      last_name: evaluator.lastname,
      position: evaluator.position,
      area: evaluator.area,
      email: evaluator.email
    }));
  }
  result.id = sourceObject.id
  return result;
}

/**
 * Reverse attribute mapper - converts flattened format back to nested structure
 */
export function unmapObjectAttributes(flatObject: any): any {
  const result: any = {};
  
  // Reconstruct general section
  if (flatObject.project_name || flatObject.description || flatObject.start_date || 
      flatObject.estimated_end_date || flatObject.team_members || flatObject.project_status ||
      flatObject.category || flatObject.impacted_areas || flatObject.project_leader_name) {
    
    result.general = {};
    
    // Direct reverse mappings
    if (flatObject.project_name !== undefined) result.general.title = flatObject.project_name;
    if (flatObject.description !== undefined) result.general.description = flatObject.description;
    if (flatObject.start_date !== undefined) result.general.start_date = flatObject.start_date;
    if (flatObject.estimated_end_date !== undefined) result.general.end_date = flatObject.estimated_end_date;
    if (flatObject.team_members !== undefined) result.general.team_members = flatObject.team_members;
    if (flatObject.project_status !== undefined) result.general.status = flatObject.project_status;
    if (flatObject.category !== undefined) result.general.category = flatObject.category;
    if (flatObject.impacted_areas !== undefined) result.general.impacted_areas = flatObject.impacted_areas;
    
    // Reconstruct project_leader object
    if (flatObject.project_leader_name || flatObject.project_leader_last_name || 
        flatObject.project_leader_area || flatObject.project_leader_email) {
      result.general.project_leader = {};
      
      if (flatObject.project_leader_name !== undefined) result.general.project_leader.name = flatObject.project_leader_name;
      if (flatObject.project_leader_last_name !== undefined) result.general.project_leader.last_name = flatObject.project_leader_last_name;
      if (flatObject.project_leader_area !== undefined) result.general.project_leader.area = flatObject.project_leader_area;
      if (flatObject.project_leader_email !== undefined) result.general.project_leader.email = flatObject.project_leader_email;
    }
  }
  
  // Reconstruct impact section
  if (flatObject.business_need || flatObject.technical_approach || flatObject.business_benefits) {
    result.impact = {};
    
    if (flatObject.business_need !== undefined) result.impact.business_problem = flatObject.business_need;
    if (flatObject.technical_approach !== undefined) result.impact.technical_approach = flatObject.technical_approach;
    
    if (flatObject.business_benefits && Array.isArray(flatObject.business_benefits)) {
      result.impact.benefits = flatObject.business_benefits.map((benefit: any) => ({
        benefit: benefit.business_driver_name,
        unit: benefit.unit,
        impact_value: benefit.impact_value,
        metric: benefit.metric,
        business_driver: benefit.business_driver
      }));
    }
  }
  
  // Reconstruct evidence section
  if (flatObject.evidences) {
    result.evidence = {};
    
    if (flatObject.evidences && Array.isArray(flatObject.evidences)) {
      result.evidence.evidences = flatObject.evidences.map((evidence: any) => ({
        capabilities_id: evidence.content,
        competency: evidence.capacity_name,
        competency_id: evidence.capacity,
        contribution_percentage: evidence.contribution_percentage
      }));
    }
  }
  
  // Reconstruct review section
  if (flatObject.evaluators) {
    result.review = {};
    
    if (flatObject.evaluators && Array.isArray(flatObject.evaluators)) {
      result.review.evaluators = flatObject.evaluators.map((evaluator: any) => ({
        name: evaluator.first_name,
        lastname: evaluator.last_name,
        position: evaluator.position,
        area: evaluator.area,
        email: evaluator.email
      }));
    }
  }
  result.id = flatObject.id
  return result;
}