import { IsIn, IsString, MinLength } from 'class-validator';

export const AI_EFFORTS = ['', 'off', 'low', 'medium', 'high', 'xhigh', 'max'];

export class AiSettingsDto {
  @IsString()
  @MinLength(1)
  provider: string;

  @IsString()
  @MinLength(1)
  model: string;

  @IsIn(AI_EFFORTS)
  effort: string;
}
