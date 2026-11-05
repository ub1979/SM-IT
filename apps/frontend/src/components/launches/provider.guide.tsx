import { socialProviderGuides } from '@tl_smp/helpers/utils/social-provider-guides';

export function ProviderGuide({ identifier }: { identifier: string }) {
  const guide = socialProviderGuides[identifier];
  if (!guide) return null;

  return (
    <details className="rounded-[12px] border border-tableBorder bg-btnSimple text-[13px] leading-[1.6] text-textColor">
      <summary className="cursor-pointer rounded-[12px] px-[16px] py-[12px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8b7cff]">
        Step-by-step setup guide · {guide.name}
      </summary>
      <div className="flex flex-col gap-[16px] px-[16px] pb-[16px]">
        <div>
          <h3 className="font-semibold">Before you start</h3>
          <p className="mt-[4px]">{guide.account}</p>
          <p className="mt-[8px] text-textItemBlur">{guide.access}</p>
        </div>
        <div className="flex flex-wrap gap-x-[16px] gap-y-[8px]">
          {guide.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b4a9ff] underline underline-offset-4"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
        <ol className="list-decimal ps-[20px] flex flex-col gap-[12px]">
          {guide.steps.map((step) => (
            <li key={step} className="ps-[4px]">
              {step}
            </li>
          ))}
        </ol>
        {!!guide.permissions.length && (
          <details>
            <summary className="cursor-pointer font-medium">
              Permissions SM-IT requests
            </summary>
            <ul className="mt-[8px] list-disc ps-[20px] flex flex-col gap-[4px]">
              {guide.permissions.map((scope) => (
                <li key={scope} className="break-all">
                  <code>{scope}</code>
                </li>
              ))}
            </ul>
          </details>
        )}
        <div>
          <h3 className="font-semibold">If you get stuck</h3>
          <ul className="mt-[6px] list-disc ps-[20px] flex flex-col gap-[8px]">
            {guide.troubleshooting.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-textItemBlur">
          Setup reference: 5 November 2026. Provider menus and eligibility can
          change; check the official links if your dashboard differs. A
          successful connection does not send a test post.
        </p>
      </div>
    </details>
  );
}
