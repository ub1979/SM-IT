import { PrismaRepository } from '@tl_smp/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AiSettingsDto } from '@tl_smp/nestjs-libraries/dtos/settings/ai.settings.dto';

// One row: the app has a single owner, so the choice is app-wide
const ROW_ID = 1;

@Injectable()
export class AiSettingsRepository {
  constructor(private _aiSettings: PrismaRepository<'aiSettings'>) {}

  getSettings() {
    return this._aiSettings.model.aiSettings.findUnique({
      where: {
        id: ROW_ID,
      },
    });
  }

  saveSettings({ provider, model, effort }: AiSettingsDto) {
    return this._aiSettings.model.aiSettings.upsert({
      where: {
        id: ROW_ID,
      },
      create: {
        id: ROW_ID,
        provider,
        model,
        effort,
      },
      update: {
        provider,
        model,
        effort,
      },
    });
  }
}
