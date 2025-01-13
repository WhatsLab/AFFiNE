import { Button, notify } from '@affine/component';
import { ModalHeader } from '@affine/component/auth-components';
import { OAuth } from '@affine/core/components/affine/auth/oauth';
import { AuthService, ServerService } from '@affine/core/modules/cloud';
import type { AuthSessionStatus } from '@affine/core/modules/cloud/entities/session';
import { FeatureFlagService } from '@affine/core/modules/feature-flag';
import { ServerDeploymentType } from '@affine/graphql';
import { Trans, useI18n } from '@affine/i18n';
import { ArrowRightBigIcon, PublishIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVar } from '@toeverything/theme';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import type { SignInState } from '.';
import * as style from './style.css';

export const SignInStep = ({
  state,
  changeState,
  onSkip,
  onAuthenticated,
}: {
  state: SignInState;
  changeState: Dispatch<SetStateAction<SignInState>>;
  onSkip: () => void;
  onAuthenticated?: (status: AuthSessionStatus) => void;
}) => {
  const t = useI18n();
  const serverService = useService(ServerService);
  const serverName = useLiveData(
    serverService.server.config$.selector(c => c.serverName)
  );
  const isSelfhosted = useLiveData(
    serverService.server.config$.selector(
      c => c.type === ServerDeploymentType.Selfhosted
    )
  );
  const authService = useService(AuthService);
  const featureFlagService = useService(FeatureFlagService);
  const enableMultipleCloudServers = useLiveData(
    featureFlagService.flags.enable_multiple_cloud_servers.$
  );

  // Track authentication status so we can notify user when they're signed in
  const loginStatus = useLiveData(authService.session.status$);
  useEffect(() => {
    if (loginStatus === 'authenticated') {
      notify.success({
        title: t['com.affine.auth.toast.title.signed-in'](),
        message: t['com.affine.auth.toast.message.signed-in'](),
      });
      onAuthenticated?.(loginStatus);
    }
  }, [loginStatus, onAuthenticated, t]);

  const onAddSelfhosted = useCallback(() => {
    changeState(prev => ({
      ...prev,
      step: 'addSelfhosted',
    }));
  }, [changeState]);

  return (
    <>
      <ModalHeader
        title={t['com.affine.auth.sign.in']()}
        subTitle={serverName}
      />
      {/* Only the "Continue with Google" button remains */}
      <OAuth redirectUrl={state.redirectUrl} />
    </>
  );
};
