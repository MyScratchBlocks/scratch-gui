import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import InlineMessages from '../../containers/inline-messages.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import {filterInlineAlerts} from '../../reducers/alerts';

import styles from './save-status.css';

/**
 * Uploads the current project to the server.
 */
const TWProjectUploader = ({alertsList, projectChanged}) => {
    const handleSaveAndUpload = async (downloadProjectCallback) => {
        try {
            const blob = await downloadProjectCallback();
            const file = new File([blob], 'project.sb3', {type: 'application/zip'});
            const formData = new FormData();
            formData.append('project', file);

            const projectId = window.location.hash.substring(1);
            const metaRes = await fetch(`https://editor-compiler.onrender.com/api/projects/${projectId}/meta`);
            const meta = await metaRes.json();

            if (meta.author?.username === localStorage.getItem('username')) {
                const uploadEndpoint = `https://editor-compiler.onrender.com/${projectId}/save`;
                await fetch(uploadEndpoint, {
                    method: 'POST',
                    body: formData
                });
                console.log('Project uploaded successfully.');
            } else {
                console.warn('Not authorized to upload this project.');
            }
        } catch (error) {
            console.error('Failed to upload project:', error);
        }
    };

    // Only show inline alerts if present
    if (filterInlineAlerts(alertsList).length > 0) {
        return <InlineMessages />;
    }

    return (
        <SB3Downloader>
            {(_className, downloadProjectCallback) => (
                <div
                    onClick={() => handleSaveAndUpload(downloadProjectCallback)}
                    className={styles.saveNow}
                >
                    <FormattedMessage
                        defaultMessage="Save Now"
                        description="Button to upload project to server"
                        id="tw.menuBar.saveNow"
                    />
                </div>
            )}
        </SB3Downloader>
    );
};

TWProjectUploader.propTypes = {
    alertsList: PropTypes.arrayOf(PropTypes.object),
    projectChanged: PropTypes.bool
};

const mapStateToProps = state => ({
    alertsList: state.scratchGui.alerts.alertsList,
    projectChanged: state.scratchGui.projectChanged
});

export default connect(
    mapStateToProps,
    () => ({})
)(TWProjectUploader);
