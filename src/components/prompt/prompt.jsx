import classNames from 'classnames';
import {defineMessages, FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';

import styles from './prompt.css';
import {SCRATCH_MAX_CLOUD_VARIABLES} from '../../lib/tw-cloud-limits.js';
import isScratchDesktop from '../../lib/isScratchDesktop.js';


const messages = defineMessages({
    forAllSpritesMessage: {
        defaultMessage: 'Allow all sprites',
        description: 'Option message when creating a variable for making it available to all sprites',
        id: 'gui.gui.variableScopeOptionAllSprites'
    },
    forThisSpriteMessage: {
        defaultMessage: 'Restrict to this sprite only',
        description: 'Option message when creating a varaible for making it only available to the current sprite',
        id: 'gui.gui.variableScopeOptionSpriteOnly'
    },
    cloudVarOptionMessage: {
        defaultMessage: 'Mark this variable as a cloud variable (stored on server)',
        description: 'Option message when creating a variable for making it a cloud variable, a variable that is stored on the server', /* eslint-disable-line max-len */
        id: 'gui.gui.cloudVariableOption'
    },
    availableToAllSpritesMessage: {
        defaultMessage: 'This variable will be available to all sprites.',
        description: 'A message that displays in a variable modal when the stage is selected indicating ' +
            'that the variable being created will available to all sprites.',
        id: 'gui.gui.variablePromptAllSpritesMessage'
    },
    listAvailableToAllSpritesMessage: {
        defaultMessage: 'This list will be available to all sprites.',
        description: 'A message that displays in a list modal when the stage is selected indicating ' +
            'that the list being created will available to all sprites.',
        id: 'gui.gui.listPromptAllSpritesMessage'
    }
});

const Packager = () => (
    <a
        href="https://myscratchblocks.github.io/packager"
        target="_blank"
        rel="noopener noreferrer"
    >
        {/* Should not be translated */}
        {'TurboWarp Packager'}
    </a>
);

const PromptComponent = props => (
    <Modal
        className={styles.modalContent}
        contentLabel={props.title}
        onRequestClose={props.onCancel}
        id="promptModal"
    >
        <Box className={styles.body}>
            <Box className={styles.label}>
                {props.label}
            </Box>
            <Box>
                <input
                    autoFocus
                    className={styles.variableNameTextInput}
                    defaultValue={props.defaultValue}
                    name={props.label}
                    onChange={props.onChange}
                    onFocus={props.onFocus}
                    onKeyPress={props.onKeyPress}
                />
            </Box>
            {props.showVariableOptions ?
                <div>
                    {props.isStage ?
                        <div className={styles.infoMessage}>
                            {props.showListMessage ? (
                                <FormattedMessage
                                    {...messages.listAvailableToAllSpritesMessage}
                                />
                            ) : (
                                <FormattedMessage
                                    {...messages.availableToAllSpritesMessage}
                                />
                            )}
                        </div> :
                        <Box className={styles.optionsRow}>
                            <label>
                                <input
                                    checked={props.globalSelected}
                                    name="variableScopeOption"
                                    type="radio"
                                    value="global"
                                    onChange={props.onScopeOptionSelection}
                                />
                                <FormattedMessage
                                    {...messages.forAllSpritesMessage}
                                />
                            </label>
                            <label
                                className={classNames({[styles.disabledLabel]: props.cloudSelected})}
                            >
                                <input
                                    checked={!props.globalSelected}
                                    disabled={props.cloudSelected}
                                    name="variableScopeOption"
                                    type="radio"
                                    value="local"
                                    onChange={props.onScopeOptionSelection}
                                />
                                <FormattedMessage
                                    {...messages.forThisSpriteMessage}
                                />
                            </label>
                        </Box>}
                    {props.showCloudOption ?
                        <Box className={classNames(styles.cloudOption)}>
                            <label
                                className={classNames({[styles.disabledLabel]: !props.canAddCloudVariable})}
                            >
                                <input
                                    checked={props.cloudSelected && props.canAddCloudVariable}
                                    disabled={!props.canAddCloudVariable}
                                    type="checkbox"
                                    onChange={props.onCloudVarOptionChange}
                                />
                                <FormattedMessage
                                    {...messages.cloudVarOptionMessage}
                                />
                            </label>
                        </Box> : null}
                </div> : null}

            {props.cloudSelected && !props.isAddingCloudVariableScratchSafe && (
                <Box className={styles.infoMessage}>
                    <FormattedMessage
                        // eslint-disable-next-line max-len
                        defaultMessage="If you make this cloud variable, the project will exceed MyScratchBlocks's limit of {number} variables, and some variables will not function if you upload the project to MyScratchBlocks. If you do this, you can still use the packager and get unlimited cloud variables."
                        // eslint-disable-next-line max-len
                        description="Warning that appears when adding a new cloud variable will make it exceeded MyScratchBlocks's cloud variable limit. number will be 10."
                        id="tw.scratchUnsafeCloud"
                        values={{
                            number: SCRATCH_MAX_CLOUD_VARIABLES
                        }}
                    />
                </Box>
            )}

            {props.cloudSelected && props.canAddCloudVariable && (
                <Box className={styles.infoMessage}>
                    {isScratchDesktop() ? (
                        <FormattedMessage
                            // eslint-disable-next-line max-len
                            defaultMessage="Cloud Variables Are Stored On The Server. This gives you the abilty to create online games, currencies, safe chatrooms and many more. You can have up to 250 cloud variables."
                            description="Appears when creating a cloud variable in the desktop app"
                            values={{
                                packager: <Packager />
                            }}
                            id="tw.desktopCloud"
                        />
                    ) : (
                        <FormattedMessage
                            /* eslint-disable-next-line max-len */
                            defaultMessage="Cloud Variables Are Stored On The Cloud And Allow You To Make Online Games And More. Since you are in the desktop app, cloud variables will only sync after being uploaded to the packager and a vaild cloud server being set up. Don't have one? Upload it to MyScratchBlocks which offers free hosting for cloud variables. You can learn more about the MyScratchBlocks packager at {packager}."
                            // eslint-disable-next-line max-len
                            description="Reminder that cloud variables may not work when the editor is open. {packager} is replaced with a link to open the TurboWarp Packager, always English."
                            values={{
                                packager: <Packager />
                            }}
                            id="tw.cantUseCloud"
                        />
                    )}
                </Box>
            )}

            <Box className={styles.buttonRow}>
                <button
                    className={styles.cancelButton}
                    onClick={props.onCancel}
                >
                    <FormattedMessage
                        defaultMessage="Cancel"
                        description="Button in prompt for cancelling the dialog"
                        id="gui.prompt.cancel"
                    />
                </button>
                <button
                    className={styles.okButton}
                    onClick={props.onOk}
                >
                    <FormattedMessage
                        defaultMessage="Create / Edit"
                        description="Button in prompt for confirming the dialog"
                        id="gui.prompt.ok"
                    />
                </button>
            </Box>
        </Box>
    </Modal>
);

PromptComponent.propTypes = {
    isAddingCloudVariableScratchSafe: PropTypes.bool.isRequired,
    canAddCloudVariable: PropTypes.bool.isRequired,
    cloudSelected: PropTypes.bool.isRequired,
    defaultValue: PropTypes.string,
    globalSelected: PropTypes.bool.isRequired,
    isStage: PropTypes.bool.isRequired,
    showListMessage: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onCloudVarOptionChange: PropTypes.func,
    onFocus: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    onScopeOptionSelection: PropTypes.func.isRequired,
    showCloudOption: PropTypes.bool.isRequired,
    showVariableOptions: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired
};

export default PromptComponent;
