 as default
};

};

export
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from './log';

import { setProjectTitle } from '../reducers/project-title';
import { setAuthor, setDescription } from '../reducers/tw';

// Fetch metadata for a project
export const fetchProjectMeta = async projectId => {
    const username = localStorage.getItem('username') || 'test';
    const token = username; // Replace with actual token key if needed

    const isAdmin = new URLSearchParams(window.location.search).get('Admin') === 'True';

    const query = isAdmin ? '?Admin=True' : '';
    const urls = [
        `https://Editor-Compiler.onrender.com/api/projects/${projectId}/meta/${username}${query}`
    ];

    let firstError;

    for (const url of urls) {
        try {
            const res = await fetch(url, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                return data;
            }

            if (res.status === 404) {
                throw new Error('Project is probably unshared');
            }

            throw new Error(`Unexpected status code: ${res.status}`);
        } catch (err) {
            if (!firstError) {
                firstError = err;
            }
        }
    }

    throw firstError;
};

// Meta tag helper
const getNoIndexTag = () => document.querySelector('meta[name="robots"][content="noindex"]');

const setIndexable = indexable => {
    if (indexable) {
        const tag = getNoIndexTag();
        if (tag) tag.remove();
    } else if (!getNoIndexTag()) {
        const tag = document.createElement('meta');
        tag.name = 'robots';
        tag.content = 'noindex';
        document.head.appendChild(tag);
    }
};

// Higher-order component
const TWProjectMetaFetcherHOC = function (WrappedComponent) {
    class ProjectMetaFetcherComponent extends React.Component {
        componentDidUpdate(prevProps) {
            if (this.props.reduxProjectId !== prevProps.reduxProjectId) {
                this.props.onSetAuthor('', '');
                this.props.onSetDescription('', '');
                const projectId = this.props.reduxProjectId;

                if (projectId === '0') {
                    // Skip fetching for default ID
                    return;
                }

                fetchProjectMeta(projectId).then(data => {
                    if (this.props.reduxProjectId !== projectId) {
                        return; // Ignore stale response
                    }

                    const title = data.title;
                    if (title) {
                        this.props.onSetProjectTitle(title);
                    }

                    const authorName = data.author.username;
                    const authorThumbnail = `https://trampoline.turbowarp.org/avatars/${data.author.id}`;
                    this.props.onSetAuthor(authorName, authorThumbnail);

                    const instructions = data.instructions || '';
                    const credits = data.description || '';
                    if (instructions || credits) {
                        this.props.onSetDescription(instructions, credits);
                    }

                    setIndexable(true);
                }).catch(err => {
                    setIndexable(false);
                    if (`${err}`.includes('unshared')) {
                        this.props.onSetDescription('unshared', 'unshared');
                    }
                    log.warn('cannot fetch project meta', err);
                });
            }
        }

        render() {
            const {
                // eslint-disable-next-line no-unused-vars
                reduxProjectId,
                onSetAuthor,
                onSetDescription,
                onSetProjectTitle,
                // eslint-enable-next-line no-unused-vars
                ...props
            } = this.props;

            return <WrappedComponent {...props} />;
        }
    }

    ProjectMetaFetcherComponent.propTypes = {
        reduxProjectId: PropTypes.string,
        onSetAuthor: PropTypes.func,
        onSetDescription: PropTypes.func,
        onSetProjectTitle: PropTypes.func
    };

    const mapStateToProps = state => ({
        reduxProjectId: state.scratchGui.projectState.projectId
    });

    const mapDispatchToProps = dispatch => ({
        onSetAuthor: (username, thumbnail) => dispatch(setAuthor({ username, thumbnail })),
        onSetDescription: (instructions, credits) => dispatch(setDescription({ instructions, credits })),
        onSetProjectTitle: title => dispatch(setProjectTitle(title))
    });

    return connect(mapStateToProps, mapDispatchToProps)(ProjectMetaFetcherComponent);
};

export {
    TWProjectMetaFetcherHOC as default
};
