import {
  BlockMetadataModel,
  BlockMetadataModelSummary,
} from '@openops/blocks-framework';
import {
  Button,
  FormField,
  Select,
  SelectAction,
  SelectContent,
  SelectItem,
  SelectLoader,
  SelectTrigger,
  SelectValue,
} from '@openops/components/ui';
import {
  AppConnectionWithoutSensitiveData,
  BlockAction,
  BlockTrigger,
  addConnectionBrackets,
  removeConnectionBrackets,
} from '@openops/shared';
import { t } from 'i18next';
import { Plus } from 'lucide-react';
import { memo, useState } from 'react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';

import { AutoFormFieldWrapper } from '@/app/features/builder/block-properties/auto-form-field-wrapper';
import { DynamicFormValidationProvider } from '@/app/features/builder/dynamic-form-validation/dynamic-form-validation-context';

import { CreateOrEditConnectionDialog } from '@/app/features/connections/components/create-edit-connection-dialog';
import { appConnectionsHooks } from '@/app/features/connections/lib/app-connections-hooks';
import { authenticationSession } from '@/app/lib/authentication-session';
import { useBuilderStateContext } from '../../builder-hooks';

type ConnectionSelectProps = {
  disabled: boolean;
  block: BlockMetadataModelSummary | BlockMetadataModel;
  isTrigger: boolean;
};

const ConnectionSelect = memo((params: ConnectionSelectProps) => {
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectConnectionOpen, setSelectConnectionOpen] = useState(false);
  const [reconnectConnection, setReconnectConnection] =
    useState<AppConnectionWithoutSensitiveData | null>(null);
  const form = useFormContext<BlockAction | BlockTrigger>();
  const {
    data: connectionsPage,
    isLoading,
    refetch,
  } = appConnectionsHooks.useConnections({
    blockNames: [params.block.name],
    cursor: undefined,
    limit: 100,
    projectId: authenticationSession.getProjectId() ?? '',
  });

  const [refreshDynamicProperties] = useBuilderStateContext((state) => [
    state.refreshDynamicPropertiesForAuth,
  ]);
  return (
    <FormField
      control={form.control}
      name={'settings.input.auth'}
      render={({ field }) => (
        <>
          {isLoading && (
            <Select disabled={params.disabled}>
              <SelectContent>
                <SelectLoader />
              </SelectContent>
            </Select>
          )}
          {!isLoading && (
            <AutoFormFieldWrapper
              property={params.block.auth!}
              propertyName="auth"
              field={field as unknown as ControllerRenderProps}
              disabled={params.disabled}
              hideDescription={true}
              inputName="settings.input.auth"
              allowDynamicValues={!params.isTrigger}
            >
              {connectionDialogOpen && (
                <DynamicFormValidationProvider>
                  <CreateOrEditConnectionDialog
                    reconnectConnection={reconnectConnection}
                    key={reconnectConnection?.name || 'newConnection'}
                    block={params.block}
                    onConnectionCreated={async (connectionName) => {
                      await refetch();
                      field.onChange(addConnectionBrackets(connectionName));
                      refreshDynamicProperties();
                    }}
                    open={connectionDialogOpen}
                    setOpen={setConnectionDialogOpen}
                  ></CreateOrEditConnectionDialog>
                </DynamicFormValidationProvider>
              )}

              <Select
                open={selectConnectionOpen}
                onOpenChange={setSelectConnectionOpen}
                defaultValue={(field.value as string) ?? undefined}
                value={field.value ?? undefined}
                onValueChange={(v) => {
                  if (v && v !== field.value) {
                    field.onChange(v);
                  }
                }}
                disabled={params.disabled}
              >
                <div className="relative">
                  {field.value && !field.disabled && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="z-50 absolute right-8 top-2 "
                      onClick={(e) => {
                        e.stopPropagation();
                        setReconnectConnection(
                          connectionsPage?.data?.find(
                            (connection) =>
                              connection.name ===
                              removeConnectionBrackets(
                                form.getValues().settings.input.auth ?? '',
                              ),
                          ) ?? null,
                        );
                        setSelectConnectionOpen(false);
                        setConnectionDialogOpen(true);
                      }}
                    >
                      {t('Reconnect')}
                    </Button>
                  )}

                  <SelectTrigger className="flex gap-2 items-center">
                    <SelectValue
                      className="truncate flex-grow flex-shrink"
                      placeholder={t('Select a connection')}
                    >
                      {!!field.value && (
                        <div className="truncate flex-grow flex-shrink">
                          {removeConnectionBrackets(field.value)}
                        </div>
                      )}
                    </SelectValue>
                    <div className="grow"></div>
                    {/* Hidden Button to take same space as shown button */}
                    {field.value && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="z-50 opacity-0 pointer-events-none"
                      >
                        {t('Reconnect')}
                      </Button>
                    )}
                  </SelectTrigger>
                </div>

                <SelectContent>
                  <SelectAction
                    onClick={() => {
                      setReconnectConnection(null);
                      setSelectConnectionOpen(false);
                      setConnectionDialogOpen(true);
                    }}
                  >
                    <span className="flex items-center gap-1 text-primary w-full">
                      <Plus size={16} />
                      {t('Create Connection')}
                    </span>
                  </SelectAction>

                  {connectionsPage?.data &&
                    connectionsPage.data.map((connection) => {
                      return (
                        <SelectItem
                          value={addConnectionBrackets(connection.name)}
                          key={connection.name}
                        >
                          {connection.name}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </AutoFormFieldWrapper>
          )}
        </>
      )}
    ></FormField>
  );
});

ConnectionSelect.displayName = 'ConnectionSelect';
export { ConnectionSelect };
