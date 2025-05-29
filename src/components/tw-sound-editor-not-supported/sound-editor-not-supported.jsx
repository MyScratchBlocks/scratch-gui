import React from 'react';
import {FormattedMessage} from 'react-intl';
import styles from './sound-editor-not-supported.css';

const SoundEditorNotSupported = () => (
    <div className={styles.container}>
        <FormattedMessage
            defaultMessage="Your browser is a bit werid, Sound editor is not supported in this browser. Get A Better Browser!"
            // eslint-disable-next-line max-len
            description="Appears when opening the sound editor in some weird browsers that don't support the proper APIs."
            id="tw.soundEditorNotSupported"
        />
    </div>
);

export default SoundEditorNotSupported;
