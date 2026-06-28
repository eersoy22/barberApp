import { i18n } from '../../i18n/I18n.js';

export async function withNetworkHandling(action, toastView) {
  try {
    return await action();
  } catch {
    toastView.show(i18n.t('validation.networkError'));
    return null;
  }
}
