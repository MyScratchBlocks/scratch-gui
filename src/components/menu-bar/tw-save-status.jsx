import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import InlineMessages from '../../containers/inline-messages.jsx';
import {filterInlineAlerts} from '../../reducers/alerts';
import VM from 'scratch-vm';

import styles from './save-status.css';

/**
 * Uploads the current project to the server.
 */
const TWProjectUploader = ({alertsList, projectChanged}) => {
    const handleSaveAndUpload = async () => {
        try {
            const blob = await vm.saveProjectSb3();
            const file = new File([blob], 'project.sb3', {type: 'application/zip'});
            const formData = new FormData();
            formData.append('project', file);

            const projectId = window.location.hash.substring(1);
            const metaRes = await fetch(`https://editor-compiler.onrender.com/api/projects/${projectId}/meta`);
            const meta = await metaRes.json();
            formData.append('projectName', meta.title);

            if (meta.error) {
                alert(meta.error);
                return;
            }

            if (meta.author?.username === localStorage.getItem('username')) {
                const uploadEndpoint = `https://editor-compiler.onrender.com/${projectId}/save`;
                const uploadRes = await fetch(uploadEndpoint, {
                    method: 'POST',
                    body: formData
                });
                const res = await uploadRes.json();

                if (res.error) {
                    alert(res.error);
                    return;
                }

                console.log('Project uploaded successfully.');
            } else {
                console.warn('Not authorized to upload this project.');
                alert("You don't own this project! Please use the remix function provided to remix projects. Otherwise, don't steal projects.");
            }
        } catch (error) {
            console.error('Failed to upload project:', error);
            alert("Failed to save project!");
        }
    };

    if (filterInlineAlerts(alertsList).length > 0) {
        return <InlineMessages />;
    }

    return (
        <div
            onClick={handleSaveAndUpload}
            className={styles.saveNow}
        >
            <FormattedMessage
                defaultMessage="Save Now"
                description="Button to upload project to server"
                id="tw.menuBar.saveNow"
            />
        </div>
    );
};

TWProjectUploader.propTypes = {
    alertsList: PropTypes.arrayOf(PropTypes.object),
    projectChanged: PropTypes.bool,
    downloadProjectCallback: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    alertsList: state.scratchGui.alerts.alertsList,
    projectChanged: state.scratchGui.projectChanged
});

export default connect(
    mapStateToProps,
    () => ({})
)(TWProjectUploader);
