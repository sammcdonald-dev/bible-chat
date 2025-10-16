'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatPersonaAsCookie } from '@/app/(chat)/actions';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';
import { personas } from '@/lib/ai/personas';

export function PersonSelector({
  session,
  selectedModelId,
  selectedPersonaId,
  className,
}: {
  session: Session;
  selectedModelId: string;
  selectedPersonaId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  // const [optimisticModelId, setOptimisticModelId] =
  //   useOptimistic(selectedModelId);

  const [optimisticPersonaId, setOptimisticPersonaId] =
    useOptimistic(selectedPersonaId);

  const userType = session.user.type;
  // const { availableChatModelIds } = entitlementsByUserType[userType];

  // const availableChatModels = chatModels.filter((chatModel) =>
  //   availableChatModelIds.includes(chatModel.id),
  // );

  // const selectedChatModel = useMemo(
  //   () =>
  //     availableChatModels.find(
  //       (chatModel) => chatModel.id === optimisticModelId,
  //     ),
  //   [optimisticModelId, availableChatModels],
  // );
  const selectedPersona = useMemo(
    () => personas.find((persona) => persona.id === optimisticPersonaId),
    [optimisticPersonaId],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="ghost"
          className="px-2 md:h-[34px] w-full justify-between"
        >
          {selectedPersona?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {personas.map((persona) => {
          const { id } = persona;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticPersonaId(id);
                  saveChatPersonaAsCookie(id);
                });
              }}
              data-active={id === optimisticPersonaId}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{persona.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {persona.description}
                  </div>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
