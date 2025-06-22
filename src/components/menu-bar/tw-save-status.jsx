import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useState} from 'react'; // Import useState
import InlineMessages from '../../containers/inline-messages.jsx';
import {filterInlineAlerts} from '../../reducers/alerts';
import VM from 'scratch-vm'; // Assuming 'vm' is globally accessible or passed as a prop

import styles from './save-status.css';

/**
 * Uploads the current project to the server.
 */
const TWProjectUploader = ({alertsList, projectChanged, projectId}) => {
    // Initialize state for the save status text
    const [saveStatusText, setSaveStatusText] = useState(
        <FormattedMessage
            defaultMessage="Save Now"
            description="Button to upload project to server"
            id="tw.menuBar.saveNow"
        />
    );

    const handleSaveAndUpload = async () => {
        // Set text to "saving..." when the save process begins
        setSaveStatusText('Saving...');

        try {
            // Ensure vm is defined. If it's a global, you might need `window.vm` or pass it as a prop.
            // For now, assuming it's accessible.
            const blob = await vm.saveProjectSb3(); 
            const file = new File([blob], 'project.sb3', {type: 'application/zip'});
            const formData = new FormData();
            formData.append('project', file);

            const currentProjectId = projectId || window.location.hash.substring(1);

            const metaRes = await fetch(`https://editor-compiler.onrender.com/api/projects/${currentProjectId}/meta/${localStorage.getItem('username')}`);
            const meta = await metaRes.json();
            formData.append('projectName', meta.title);

            if (meta.error) {
                console.error(meta.error);
                setSaveStatusText('Save Failed!'); // Set status on error
                return;
            }

            if (meta.author?.username === localStorage.getItem('username')) {
                const uploadEndpoint = `https://editor-compiler.onrender.com/${currentProjectId}/save`;
                const uploadRes = await fetch(uploadEndpoint, {
                    method: 'POST',
                    body: formData
                });
                const res = await uploadRes.json();

                if (res.error) {
                    console.error(res.error);
                    setSaveStatusText('Save Failed!'); // Set status on error
                    return;
                }

                console.log('Project uploaded successfully.');
                setSaveStatusText('Saved!'); // Set text to "Saved!" on success
            } else {
                console.warn('Not authorized to upload this project.');
                setSaveStatusText("Not authorized!"); // Set status for unauthorized access
            }
        } catch (error) {
            console.error('Failed to upload project:', error);
            setSaveStatusText('Save Failed!'); // Set status on error
        }
        // You might want to reset the text after a short delay or on next interaction
        // For example, after 3 seconds, set it back to "Save Now"
        setTimeout(() => {
            setSaveStatusText(
                <FormattedMessage
                    defaultMessage="Save Now"
                    description="Button to upload project to server"
                    id="tw.menuBar.saveNow"
                />
            );
        }, 3000); 
    };

    if (filterInlineAlerts(alertsList).length > 0) {
        return <InlineMessages />;
    }

    return (
        <div
            onClick={handleSaveAndUpload}
            className={styles.saveNow}
        >
            {saveStatusText}
        </div>
    );
};

TWProjectUploader.propTypes = {
    alertsList: PropTypes.arrayOf(PropTypes.object),
    projectChanged: PropTypes.bool,
    projectId: PropTypes.string
};

const mapStateToProps = state => ({
    alertsList: state.scratchGui.alerts.alertsList,
    projectChanged: state.scratchGui.projectChanged, 
    projectId: state.scratchGui.projectState.projectId
});

export default connect(
    mapStateToProps,
    () => ({})
)(TWProjectUploader);
