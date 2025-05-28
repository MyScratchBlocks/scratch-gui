/**
 * Copyright (C) 2021 Thomas Weber
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3.
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { getIsLoading } from '../reducers/project-state.js';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import TWProjectMetaFetcherHOC from '../lib/tw-project-meta-fetcher-hoc.jsx';
import TWStateManagerHOC from '../lib/tw-state-manager-hoc.jsx';
import SBFileUploaderHOC from '../lib/sb-file-uploader-hoc.jsx';
import TWPackagerIntegrationHOC from '../lib/tw-packager-integration-hoc.jsx';
import SettingsStore from '../addons/settings-store-singleton';
import '../lib/tw-fix-history-api';
import GUI from './render-gui.jsx';
import MenuBar from '../components/menu-bar/menu-bar.jsx';
import ProjectInput from '../components/tw-project-input/project-input.jsx';
import FeaturedProjects from '../components/tw-featured-projects/featured-projects.jsx';
import Description from '../components/tw-description/description.jsx';
import BrowserModal from '../components/browser-modal/browser-modal.jsx';
import CloudVariableBadge from '../containers/tw-cloud-variable-badge.jsx';
import { isBrowserSupported } from '../lib/tw-environment-support-prober';
import AddonChannels from '../addons/channels';
import { loadServiceWorker } from './load-service-worker';
import runAddons from '../addons/entry';
import InvalidEmbed from '../components/tw-invalid-embed/invalid-embed.jsx';
import { APP_NAME } from '../lib/brand.js';
import VM from 'scratch-vm';

import styles from './interface.css';

const isInvalidEmbed = false;

const handleClickAddonSettings = addonId => {
    const path = process.env.ROUTING_STYLE === 'wildcard' ? 'addons' : 'addons.html';
    const url = `${process.env.ROOT}${path}${typeof addonId === 'string' ? `#${addonId}` : ''}`;
    window.open(url);
};

const messages = defineMessages({
    defaultTitle: {
        defaultMessage: 'Run Scratch projects faster',
        description: 'Title of homepage',
        id: 'tw.guiDefaultTitle'
    }
});

const WrappedMenuBar = compose(
    SBFileUploaderHOC,
    TWPackagerIntegrationHOC
)(MenuBar);

if (AddonChannels.reloadChannel) {
    AddonChannels.reloadChannel.addEventListener('message', () => {
        location.reload();
    });
}

if (AddonChannels.changeChannel) {
    AddonChannels.changeChannel.addEventListener('message', e => {
        SettingsStore.setStoreWithVersionCheck(e.data);
    });
}

runAddons();

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.footerContent}>
            <div className={styles.footerText}>
                <FormattedMessage
                    defaultMessage="{APP_NAME} is not affiliated with Scratch, the Scratch Team, or the Scratch Foundation."
                    id="tw.footer.disclaimer"
                    values={{ APP_NAME }}
                />
            </div>
            <div className={styles.footerText}>
                <FormattedMessage
                    defaultMessage="Scratch is a project of the Scratch Foundation. It is available for free at {scratchDotOrg}."
                    id="tw.footer.scratchDisclaimer"
                    values={{
                        scratchDotOrg: (
                            <a href="https://scratch.org/" target="_blank" rel="noreferrer">
                                {'https://scratch.org/'}
                            </a>
                        )
                    }}
                />
            </div>
            <div className={styles.footerColumns}>
                <div className={styles.footerSection}>
                    <a href="credits.html">
                        <FormattedMessage defaultMessage="Credits" id="tw.footer.credits" />
                    </a>
                    <a href="https://github.com/sponsors/GarboMuffin">
                        <FormattedMessage defaultMessage="Donate" id="tw.footer.donate" />
                    </a>
                </div>
                <div className={styles.footerSection}>
                    <a href="https://desktop.turbowarp.org/">TurboWarp Desktop</a>
                    <a href="https://packager.turbowarp.org/">TurboWarp Packager</a>
                    <a href="https://docs.turbowarp.org/embedding">
                        <FormattedMessage defaultMessage="Embedding" id="tw.footer.embed" />
                    </a>
                    <a href="https://docs.turbowarp.org/url-parameters">
                        <FormattedMessage defaultMessage="URL Parameters" id="tw.footer.parameters" />
                    </a>
                    <a href="https://docs.turbowarp.org/">
                        <FormattedMessage defaultMessage="Documentation" id="tw.footer.documentation" />
                    </a>
                </div>
                <div className={styles.footerSection}>
                    <a href="https://scratch.mit.edu/users/GarboMuffin/#comments">
                        <FormattedMessage defaultMessage="Feedback & Bugs" id="tw.feedback" />
                    </a>
                    <a href="https://github.com/TurboWarp/">
                        <FormattedMessage defaultMessage="Source Code" id="tw.code" />
                    </a>
                    <a href="privacy.html">
                        <FormattedMessage defaultMessage="Privacy Policy" id="tw.privacy" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

class Interface extends React.Component {
    constructor(props) {
        super(props);
        this.handleUpdateProjectTitle = this.handleUpdateProjectTitle.bind(this);
        this.saveProjectToLocalStorage = this.saveProjectToLocalStorage.bind(this);
        this.projectSaveInterval = null;
        this.autoPostInterval = null;
    }

    componentDidMount() {
        this.projectSaveInterval = setInterval(() => {
            this.saveProjectToLocalStorage();
        }, 5000);

        this.autoPostInterval = setInterval(() => {
            this.sendAutoSave();
        }, 10000);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isLoading && !this.props.isLoading) {
            loadServiceWorker();
        }
    }

    componentWillUnmount() {
        if (this.projectSaveInterval) {
            clearInterval(this.projectSaveInterval);
        }
        if (this.autoPostInterval) {
            clearInterval(this.autoPostInterval);
        }
    }

    async saveProjectToLocalStorage() {
        if (!this.props.projectTitle) return;

        try {
            const file = await VM.saveProjectSb3;
            const buffer = await file.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            localStorage.setItem('sb3', base64);
            localStorage.setItem('projectName', this.props.projectTitle);
        } catch (err) {
            console.error('Failed to save project to localStorage:', err);
        }
    }

    async sendAutoSave() {
        try {
            const file = await VM.saveProjectSb3();
            const formData = new FormData();
            formData.append('project', file, 'project.sb3');

            const projectId = window.location.hash.substring(1);
            if (!projectId) return;

            const response = await fetch(`https://editor-compiler.onrender.com/${projectId}/save`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                console.warn('Auto-save POST failed:', response.status);
            }
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    }

    handleUpdateProjectTitle(title, isDefault) {
        if (isDefault || !title) {
            document.title = `${APP_NAME} - ${this.props.intl.formatMessage(messages.defaultTitle)}`;
        } else {
            document.title = `${title} - ${APP_NAME}`;
        }
    }

    render() {
        if (isInvalidEmbed) return <InvalidEmbed />;

        const {
            intl,
            hasCloudVariables,
            description,
            isFullScreen,
            isLoading,
            isPlayerOnly,
            isRtl,
            projectId,
            ...props
        } = this.props;

        const isHomepage = isPlayerOnly && !isFullScreen;
        const isEditor = !isPlayerOnly;

        return (
            <div className={classNames(styles.container, {
                [styles.playerOnly]: isHomepage,
                [styles.editor]: isEditor
            })} dir={isRtl ? 'rtl' : 'ltr'}>
                {isHomepage && (
                    <div className={styles.menu}>
                        <WrappedMenuBar
                            canChangeLanguage
                            canManageFiles
                            canChangeTheme
                            enableSeeInside
                            onClickAddonSettings={handleClickAddonSettings}
                        />
                    </div>
                )}
                <div
                    className={styles.center}
                    style={isPlayerOnly ? ({
                        width: `${Math.max(480, props.customStageSize.width) + 2}px`
                    }) : null}
                >
                    <GUI
                        onClickAddonSettings={handleClickAddonSettings}
                        onUpdateProjectTitle={this.handleUpdateProjectTitle}
                        backpackVisible
                        backpackHost="_local_"
                        {...props}
                    />
                    {isHomepage && (
                        <>
                            {!isBrowserSupported() && <BrowserModal isRtl={isRtl} />}
                            <div className={styles.section}><ProjectInput /></div>
                            {(description.instructions === 'unshared' || description.credits === 'unshared') && (
                                <div className={classNames(styles.infobox, styles.unsharedUpdate)}>
                                    <p><FormattedMessage defaultMessage="Unshared projects are no longer visible." id="tw.unshared2.1" /></p>
                                    <p><FormattedMessage defaultMessage="For more information, visit: {link}" id="tw.unshared.2" values={{ link: <a href="https://docs.turbowarp.org/unshared-projects" target="_blank" rel="noopener noreferrer">{'https://docs.turbowarp.org/unshared-projects'}</a> }} /></p>
                                    <p><FormattedMessage defaultMessage="If the project was shared recently, this message may appear incorrectly for a few minutes." id="tw.unshared.cache" /></p>
                                    <p><FormattedMessage defaultMessage="If this project is actually shared, please report a bug." id="tw.unshared.bug" /></p>
                                </div>
                            )}
                            {hasCloudVariables && projectId !== '0' && (
                                <div className={styles.section}><CloudVariableBadge /></div>
                            )}
                            {(description.instructions || description.credits) && (
                                <div className={styles.section}>
                                    <Description instructions={description.instructions} credits={description.credits} projectId={projectId} />
                                </div>
                            )}
                            <div className={styles.section}>
                                <p><FormattedMessage defaultMessage="{APP_NAME} is a Scratch mod that compiles projects to JavaScript to make them run really fast..." id="tw.home.description" values={{ APP_NAME }} /></p>
                            </div>
                            <div className={styles.section}><FeaturedProjects studio="27205657" /></div>
                        </>
                    )}
                </div>
                {isHomepage && <Footer />}
            </div>
        );
    }
}

Interface.propTypes = {
    intl: intlShape,
    hasCloudVariables: PropTypes.bool,
    customStageSize: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
    description: PropTypes.shape({ credits: PropTypes.string, instructions: PropTypes.string }),
    isFullScreen: PropTypes.bool,
    isLoading: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isRtl: PropTypes.bool,
    projectId: PropTypes.string,
    projectTitle: PropTypes.string
};

const mapStateToProps = state => ({
    hasCloudVariables: state.scratchGui.tw.hasCloudVariables,
    customStageSize: state.scratchGui.customStageSize,
    description: state.scratchGui.tw.description,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isLoading: getIsLoading(state.scratchGui.projectState.loadingState),
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
    isRtl: state.locales.isRtl,
    projectId: state.scratchGui.projectState.projectId,
    projectTitle: state.projectTitle
});

const ConnectedInterface = injectIntl(connect(mapStateToProps)(Interface));

const WrappedInterface = compose(
    AppStateHOC,
    ErrorBoundaryHOC('TW Interface'),
    TWProjectMetaFetcherHOC,
    TWStateManagerHOC,
    TWPackagerIntegrationHOC
)(ConnectedInterface);

export default WrappedInterface;
