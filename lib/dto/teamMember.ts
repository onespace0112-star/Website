import type { TeamMember } from "@prisma/client";
import { serializeDate } from "./serialize";

/**
 * DTO for TeamMember (scalar fields only).
 */
export type TeamMemberDTO = {
  id: number;
  name: string;
  position: string;
  image: string | null;
  serviceMotion: string | null;
  skills: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  responsibilities: string | null;
  workingYears: string | null;
};

/**
 * Serialize a TeamMember model into a JSON-safe DTO.
 */
export function serializeTeamMember(teamMember: TeamMember): TeamMemberDTO {
  return {
    id: teamMember.id,
    name: teamMember.name,
    position: teamMember.position,
    image: teamMember.image,
    serviceMotion: teamMember.serviceMotion,
    skills: teamMember.skills,
    order: teamMember.order,
    createdAt: serializeDate(teamMember.createdAt)!,
    updatedAt: serializeDate(teamMember.updatedAt)!,
    responsibilities: teamMember.responsibilities,
    workingYears: teamMember.workingYears,
  };
}
