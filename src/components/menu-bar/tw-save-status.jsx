import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import InlineMessages from '../../containers/inline-messages.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import {filterInlineAlerts} from '../../reducers/alerts';

import styles from './save-status.css';

const TWSaveStatus = ({
    alertsList,
    fileHandle,
    projectChanged,
    showSaveFilePicker
}) => {
    const handleSaveAndUpload = async (downloadProjectCallback) => {
        try {
            const blob = await downloadProjectCallback(); // Get the sb3 file blob
            const file = new File([blob], 'project.sb3', {type: 'application/zip'});
            const formData = new FormData();
            formData.append('project', file);

            const res = await fetch(`https://editor-compiler.onrender.com/api/projects/${window.location.hash.substring(1)}/meta`);
            const json = await res.json();
            if (json.author?.username === localStorage.getItem('username')) { 
              const projectId = window.location.hash.substring(1);
              const endpoint = `https://editor-compiler.onrender.com/${projectId}/Save`;

              await fetch(endpoint, {
                  method: 'POST',
                  body: formData
              });

            console.log('Project uploaded successfully.');
         } catch (error) {
            console.error('Failed to upload project:', error);
            }
    
    };

    return (
        filterInlineAlerts(alertsList).length > 0 ? (
            <InlineMessages />
        ) : projectChanged && (
            <SB3Downloader showSaveFilePicker={showSaveFilePicker}>
                {(_className, downloadProjectCallback, {smartSave}) => (
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
        )
    );
};

TWSaveStatus.propTypes = {
    alertsList: PropTypes.arrayOf(PropTypes.object),
    fileHandle: PropTypes.shape({
        name: PropTypes.string
    }),
    projectChanged: PropTypes.bool,
    showSaveFilePicker: PropTypes.func
};

const mapStateToProps = state => ({
    alertsList: state.scratchGui.alerts.alertsList,
    fileHandle: state.scratchGui.tw.fileHandle,
    projectChanged: state.scratchGui.projectChanged
});

export default connect(
    mapStateToProps,
    () => ({})
)(TWSaveStatus);
