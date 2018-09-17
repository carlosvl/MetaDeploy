// @flow

import * as React from 'react';
import Button from '@salesforce/design-system-react/components/button';
import Input from '@salesforce/design-system-react/components/input';
import Modal from '@salesforce/design-system-react/components/modal';

type Props = {
  isOpen: boolean,
  toggleModal: boolean => void,
};

class CustomDomainModal extends React.Component<Props, { url: string }> {
  constructor(props: Props) {
    super(props);
    this.state = { url: '' };
  }

  handleClose = () => {
    this.props.toggleModal(false);
    this.setState({ url: '' });
  };

  handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const val = this.state.url.trim();
    if (!val) {
      return;
    }
    const baseUrl = window.api_urls.salesforce_custom_login();
    window.location.assign(`${baseUrl}?custom_domain=${val}`);
  };

  handleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ url: event.target.value });
  };

  render(): React.Node {
    const footer = [
      <Button key="cancel" label="Cancel" onClick={this.handleClose} />,
      <Button
        key="submit"
        label="Continue"
        variant="brand"
        onClick={this.handleSubmit}
      />,
    ];
    return (
      <Modal
        isOpen={this.props.isOpen}
        title="Use Custom Domain"
        onRequestClose={this.handleClose}
        footer={footer}
      >
        <form className="slds-p-around_large" onSubmit={this.handleSubmit}>
          <p
            className="slds-form-element__help
              slds-p-bottom_small"
          >
            To go to your company&rsquo;s login page, enter the custom domain
            name.
          </p>
          <Input
            id="login-custom-domain"
            label="Custom Domain"
            value={this.state.url}
            onChange={this.handleChange}
            aria-describedby="login-custom-domain-help"
          >
            <p
              id="login-custom-domain-help"
              className="slds-form-element__help
                slds-truncate
                slds-p-top_small"
            >
              https://
              {this.state.url.trim() ? (
                this.state.url.trim()
              ) : (
                <em data-testid="custom-domain">domain</em>
              )}
              .my.salesforce.com
            </p>
          </Input>
        </form>
      </Modal>
    );
  }
}

export default CustomDomainModal;