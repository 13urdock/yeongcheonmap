import { IsBoolean } from 'class-validator';

// PATCH /admin/stories/{storyId}/visibility body
export class SetStoryHiddenDto {
  @IsBoolean()
  hidden: boolean;
}
