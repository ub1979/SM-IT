import { Injectable } from '@nestjs/common';
import { Provider, User } from '@prisma/client';
import { UsersService } from '@tl_smp/nestjs-libraries/database/prisma/users/users.service';
import { OrganizationService } from '@tl_smp/nestjs-libraries/database/prisma/organizations/organization.service';
import { AuthService as AuthChecker } from '@tl_smp/helpers/auth/auth.service';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  private _creatingOwner: Promise<User> | null = null;

  constructor(
    private _userService: UsersService,
    private _organizationService: OrganizationService
  ) {}

  // The oldest account is the owner, so an existing database keeps its data.
  async getOwner(): Promise<User> {
    const owner = await this._userService.getOldestUser();
    if (owner) {
      return owner.activated
        ? owner
        : this._userService.activateUser(owner.id);
    }

    // A new database gets several requests at once on the first page load
    this._creatingOwner ??= this.createOwner().finally(() => {
      this._creatingOwner = null;
    });
    return this._creatingOwner;
  }

  private async createOwner() {
    const create = await this._organizationService.createOrgAndUser(
      {
        company: 'SM-IT',
        email: 'owner@tl-smp.invalid',
        password: '',
        provider: Provider.LOCAL,
        datafast_visitor_id: '',
      },
      '',
      ''
    );
    return this._userService.activateUser(create.users[0].user.id);
  }

  public getOrgFromCookie(cookie?: string) {
    if (!cookie) {
      return false;
    }

    try {
      const getOrg: any = AuthChecker.verifyJWT(cookie);
      if (
        typeof getOrg.orgId !== 'string' ||
        typeof getOrg.id !== 'string' ||
        !['USER', 'ADMIN'].includes(getOrg.role) ||
        !getOrg.timeLimit ||
        dayjs(getOrg.timeLimit).isBefore(dayjs())
      ) {
        return false;
      }

      return getOrg as {
        email: string;
        role: 'USER' | 'ADMIN';
        orgId: string;
        id: string;
      };
    } catch (err) {
      return false;
    }
  }
}
