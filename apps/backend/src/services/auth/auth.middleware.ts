import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@tl_smp/backend/services/auth/auth.service';
import { User } from '@prisma/client';
import { OrganizationService } from '@tl_smp/nestjs-libraries/database/prisma/organizations/organization.service';
import { getCookieUrlFromDomain } from '@tl_smp/helpers/subdomain/subdomain.management';
import { HttpForbiddenException } from '@tl_smp/nestjs-libraries/services/exception.filter';
import { MastraService } from '@tl_smp/nestjs-libraries/chat/mastra.service';
import { setSentryUserContext } from '@tl_smp/nestjs-libraries/sentry/initialize.sentry';

export const removeAuth = (res: Response) => {
  res.cookie('auth', '', {
    domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
    ...(!process.env.NOT_SECURED
      ? {
          secure: true,
          httpOnly: true,
          sameSite: 'none',
        }
      : {}),
    expires: new Date(0),
    maxAge: -1,
  });
  res.header('logout', 'true');
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private _organizationService: OrganizationService,
    private _authService: AuthService
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // SM-IT has no sign-in: every request acts as the local owner.
      const orgHeader = req.cookies.showorg || req.headers.showorg;
      let user = (await this._authService.getOwner()) as User;

      const impersonate = req.cookies.impersonate || req.headers.impersonate;
      if (user?.isSuperAdmin && impersonate) {
        const loadImpersonate = await this._organizationService.getUserOrg(
          impersonate
        );

        if (loadImpersonate) {
          user = loadImpersonate.user;
          user.isSuperAdmin = true;
          delete user.password;

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          req.user = user;

          // @ts-ignore
          loadImpersonate.organization.users =
            loadImpersonate.organization.users.filter(
              (f) => f.userId === user.id
            );
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          req.org = loadImpersonate.organization;

          setSentryUserContext({
            userId: user.id,
            email: user.email,
            orgId: loadImpersonate.organization.id,
            paymentId: loadImpersonate.organization.paymentId,
          });
          next();
          return;
        }
      }

      delete user.password;
      const organization = (
        await this._organizationService.getOrgsByUserId(user.id)
      ).filter((f) => !f.users[0].disabled);
      const setOrg =
        organization.find((org) => org.id === orgHeader) ||
        organization.find((org) => org.subscription) ||
        organization[0];

      if (!organization) {
        throw new HttpForbiddenException();
      }

      if (!setOrg.apiKey) {
        await this._organizationService.updateApiKey(setOrg.id);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.user = user;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.org = setOrg;

      setSentryUserContext({
        userId: user.id,
        email: user.email,
        orgId: setOrg.id,
        paymentId: setOrg.paymentId,
      });
    } catch (err) {
      throw new HttpForbiddenException();
    }
    next();
  }
}
