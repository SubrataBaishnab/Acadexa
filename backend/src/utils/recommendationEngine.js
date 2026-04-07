/**
 * Recommendation Engine for Supervisor and Professor Matching
 * Uses cosine similarity and keyword matching
 */

const calculateSimilarity = (studentInterests, professorAreas) => {
  if (!studentInterests.length || !professorAreas.length) {
    return 0;
  }

  // Convert to lowercase for comparison
  const student = studentInterests.map(s => s.toLowerCase());
  const professor = professorAreas.map(p => p.toLowerCase());

  // Calculate intersection
  const matches = student.filter(s => 
    professor.some(p => p.includes(s) || s.includes(p))
  );

  // Simple Jaccard similarity: intersection / union
  const union = new Set([...student, ...professor]);
  return (matches.length / union.size) * 100;
};

const rankSupervisors = (supervisors, studentProfile, limit = 10) => {
  const scored = supervisors
    .filter(supervisor => supervisor.isActive && supervisor.availableSlots > 0)
    .map(supervisor => ({
      ...supervisor.toObject(),
      matchScore: calculateSimilarity(
        studentProfile.researchInterests || [],
        supervisor.researchAreas || []
      ),
      matchReason: generateMatchReason(studentProfile, supervisor),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

const rankProfessors = (professors, studentProfile, limit = 10) => {
  const scored = professors
    .filter(prof => prof.acceptsPhDStudents)
    .map(professor => ({
      ...professor.toObject(),
      matchScore: calculateSimilarity(
        studentProfile.researchInterests || [],
        professor.researchAreas || []
      ),
      countryMatch: studentProfile.preferredCountries?.includes(professor.country) ? 20 : 0,
      matchReason: generateProfessorMatchReason(studentProfile, professor),
    }))
    .map(prof => ({
      ...prof,
      totalScore: prof.matchScore + prof.countryMatch,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  return scored;
};

const generateMatchReason = (student, supervisor) => {
  const commonAreas = (student.researchInterests || [])
    .filter(interest => 
      (supervisor.researchAreas || []).some(area => 
        area.toLowerCase().includes(interest.toLowerCase())
      )
    );

  if (commonAreas.length > 0) {
    return `Strong match in ${commonAreas.join(', ')}. Supervisor has ${supervisor.publicationsCount || 0} publications in these areas.`;
  }
  
  return `Supervisor has expertise in ${(supervisor.researchAreas || []).slice(0, 2).join(', ')}.`;
};

const generateProfessorMatchReason = (student, professor) => {
  const commonAreas = (student.researchInterests || [])
    .filter(interest => 
      (professor.researchAreas || []).some(area => 
        area.toLowerCase().includes(interest.toLowerCase())
      )
    );

  let reason = '';
  
  if (commonAreas.length > 0) {
    reason += `Excellent research match in ${commonAreas.join(', ')}. `;
  }

  if (student.preferredCountries?.includes(professor.country)) {
    reason += `Located in your preferred country (${professor.country}). `;
  }

  reason += `H-index: ${professor.h_index || 'N/A'}, Publications: ${professor.publicationsCount || 0}.`;

  return reason;
};

module.exports = {
  calculateSimilarity,
  rankSupervisors,
  rankProfessors,
  generateMatchReason,
  generateProfessorMatchReason,
};
