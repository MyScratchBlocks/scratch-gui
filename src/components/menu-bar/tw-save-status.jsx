import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React, {useRef, useState} from 'react';
import InlineMessages from '../../containers/inline-messages.jsx';
import {filterInlineAlerts} from '../../reducers/alerts';
import VM from 'scratch-vm';

import styles from './save-status.css';

const TWProjectUploader = ({alertsList, projectChanged, projectId}) => {
    const [saveStatusText, setSaveStatusText] = useState(
        <FormattedMessage
            defaultMessage="Save Now"
            description="Button to upload project to server"
            id="tw.menuBar.saveNow"
        />
    );

    const fileInputRef = useRef(null); // Reference to the hidden file input

    const handleSaveClick = () => {
        if (!localStorage.getItem('username')) {
            setSaveStatusText('Login To Save!');
            return;
        }
        fileInputRef.current.click(); // Trigger file input dialog
    };

    const handleFileChange = async (event) => {
        const thumbnailFile = event.target.files[0];
        if (!thumbnailFile) return;

        setSaveStatusText('Saving...');

        try {
            const blob = await vm.saveProjectSb3();
            const projectFile = new File([blob], 'project.sb3', {type: 'application/zip'});
            const formData = new FormData();
            formData.append('project', projectFile);
            formData.append('thumbnail', thumbnailFile); // Append thumbnail

            const currentProjectId = projectId || window.location.hash.substring(1);
            const metaRes = await fetch(`https://editor-compiler.onrender.com/api/projects/${currentProjectId}/meta/${localStorage.getItem('username')}`);
            const meta = await metaRes.json();

            if (meta.error) {
                console.error(meta.error);
                setSaveStatusText('Save Failed!');
                return;
            }

            formData.append('projectName', meta.title);

            if (meta.author?.username === localStorage.getItem('username')) {
                const uploadEndpoint = `https://editor-compiler.onrender.com/${currentProjectId}/save`;
                const uploadRes = await fetch(uploadEndpoint, {
                    method: 'POST',
                    body: formData
                });
                const res = await uploadRes.json();

                if (res.error) {
                    console.error(res.error);
                    setSaveStatusText('Save Failed!');
                    return;
                }

                console.log('Project uploaded successfully.');
                setSaveStatusText('Saved!');
            } else {
                console.warn('Not authorized to upload this project.');
                setSaveStatusText("Not authorized!");
            }
        } catch (error) {
            console.error('Failed to upload project:', error);
            setSaveStatusText('Save Failed!');
        }

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
        <div>
            <div onClick={handleSaveClick} className={styles.saveNow}>
                {saveStatusText}
            </div>
            <input
                type="file"
                accept="image/*"
                style={{display: 'none'}}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
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
