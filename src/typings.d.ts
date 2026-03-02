declare var Stripe: any;
declare var elements: any;

// Google Sign-In (GSI) typings
declare namespace google {
  namespace accounts {
    namespace id {
      interface GsiButtonConfiguration {
        type?: 'standard' | 'icon';
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        logo_alignment?: 'left' | 'center';
        width?: number;
        locale?: string;
      }

      interface IdConfiguration {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: string;
      }

      interface CredentialResponse {
        credential: string;
        select_by: string;
        clientId?: string;
      }

      function initialize(config: IdConfiguration): void;
      function renderButton(
        parent: HTMLElement,
        config: GsiButtonConfiguration,
      ): void;
      function prompt(): void;
      function disableAutoSelect(): void;
    }
  }
}
