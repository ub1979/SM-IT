import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AiConnectionActionDto {
  @IsIn([
    'save-key',
    'save-endpoint',
    'start-login',
    'poll-login',
    'submit-login',
    'cancel-login',
  ])
  action: string;

  @IsOptional() @IsString() @MaxLength(200) provider?: string;
  @IsOptional() @IsString() @MaxLength(200) sessionId?: string;
  @IsOptional() @IsString() @MaxLength(4096) code?: string;
  @IsOptional() @IsString() @MaxLength(200) key?: string;
  @IsOptional() @IsString() @MaxLength(16000) value?: string;
  @IsOptional() @IsString() @MaxLength(200) id?: string;
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(2048) base_url?: string;
  @IsOptional() @IsString() @MaxLength(200) model?: string;
  @IsOptional() @IsString() @MaxLength(16000) api_key?: string;
  @IsOptional() @IsBoolean() discover_models?: boolean;
}
