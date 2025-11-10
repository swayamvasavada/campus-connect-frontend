import { useState, useEffect } from 'react';
import { Alert } from "@mui/material";
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import "../../assets/styles/modal.css";
import "../../assets/styles/members.css";

export default function MembersModal({ onClose, groupId, currentUser }) {
    const [members, setMembers] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState('member');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', userId: null, userName: '' });

    const canManage = currentUserRole === 'creator' || currentUserRole === 'moderator';

    useEffect(function () {
        async function fetchData() {
            console.log("Group id: ", groupId);
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/members/${groupId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await res.json();
                if (result.hasError) {
                    setError(result.message);
                    return;
                }

                setMembers(result.result);
                setCurrentUserRole(result.userRole);
            } catch (error) {
                setError('Something went wrong!');
            }

            setLoading(false);
        }

        fetchData();
    }, [groupId]);

    function getDialogContent() {
        switch (confirmDialog.type) {
            case 'remove':
                return {
                    title: 'Remove Member?',
                    message: `Are you sure you want to remove ${confirmDialog.userName} from this group?`,
                    confirmText: 'Remove',
                    confirmColor: '#ef4444'
                };
            case 'promote':
                return {
                    title: 'Promote to Moderator?',
                    message: `Make ${confirmDialog.userName} a moderator? They will be able to manage tasks and other members.`,
                    confirmText: 'Promote',
                    confirmColor: '#2dd4bf'
                };
            case 'demote':
                return {
                    title: 'Remove Moderator Status?',
                    message: `Remove ${confirmDialog.userName}'s moderator privileges? They will become a regular member.`,
                    confirmText: 'Demote',
                    confirmColor: '#fbbf24'
                };
            default:
                return { title: '', message: '', confirmText: '', confirmColor: '' };
        }
    };

    const dialogContent = getDialogContent();

    function handleActionClick(type, user) {
        setConfirmDialog({
            open: true,
            type,
            userId: user._id,
            userName: user.name
        });
    };

    async function promoteUser(userId) {
        const formData = { userId, groupId }
        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/promote-member`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.hasError) {
                setError(result.message);
                return;
            }
        } catch (error) {
            console.log("Error: ", error);
            setError("Something went wrong");
        }
    }

    async function demoteUser(userId) {
        const formData = { userId, groupId }
        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/demote-member`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.hasError) {
                setError(result.message);
                return;
            }
        } catch (error) {
            console.log("Error: ", error);
            setError("Something went wrong");
        }
    }

    async function removeMember(userId) {
        const formData = {userId, groupId};
        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/remove-member`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.hasError) {
                setError(result.message);
                return;
            }
        } catch (error) {
            console.log("Error: ", error);
            setError("Something went wrong!");
        }
    }

    async function performAction() {
        const { type, userId } = confirmDialog;
        console.log(`API CALL: ${type} user ${userId} in group ${groupId}`);

        if (type === 'remove') {
            removeMember(userId);
            setMembers(current => current.filter(m => m._id !== userId));
        } else if (type === 'promote') {
            const newRole = 'moderator';
            promoteUser(userId);
            setMembers(current => current.map(m => m._id === userId ? { ...m, role: newRole } : m));
        } else {
            const newRole = 'member';
            demoteUser(userId);
            setMembers(current => current.map(m => m._id === userId ? { ...m, role: newRole } : m));
        }
        setConfirmDialog({ ...confirmDialog, open: false });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Group Members ({members.length})</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                {error && <Alert severity="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}

                {loading ? (
                    <p>Loading members...</p>
                ) : (
                    <ul className="members-list">
                        {members.map(member => (
                            <li key={member._id} className="member-item">
                                <div className="member-info">
                                    <img src={member.profilePic || `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} className="member-avatar" />                                    <div className="member-details">
                                        <h4>
                                            {member.name}
                                            {member.role === 'creator' && <span className="moderator-badge" style={{ backgroundColor: '#6366f1', color: 'white' }}>Owner</span>}
                                            {member.role === 'moderator' && <span className="moderator-badge">Mod</span>}
                                        </h4>
                                        <p>{member.email}</p>
                                    </div>
                                </div>

                                {/* Action Buttons: Only show if current user has permission AND it's not themselves AND target is not the creator */}
                                {canManage && member._id !== currentUser._id && member.role !== 'creator' && (
                                    <div className="member-actions">
                                        {member.role === 'member' && (
                                            <button
                                                className="icon-btn promote-btn"
                                                title="Promote to Moderator"
                                                onClick={() => handleActionClick('promote', member)}
                                            >
                                                <i className="fa-solid fa-shield-halved"></i>
                                            </button>
                                        )}
                                        {member.role === 'moderator' && currentUserRole === 'creator' && (
                                            <button
                                                className="icon-btn demote-btn"
                                                title="Demote to Member"
                                                onClick={() => handleActionClick('demote', member)}
                                            >
                                                <i className="fa-solid fa-user-shield"></i>
                                            </button>
                                        )}
                                        {(member.role === 'member' || (member.role === 'moderator' && currentUserRole === 'creator')) && (
                                            <button
                                                className="icon-btn remove-btn"
                                                title="Remove from Group"
                                                onClick={() => handleActionClick('remove', member)}
                                            >
                                                <i className="fa-solid fa-user-xmark"></i>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                onConfirm={performAction}
                title={dialogContent.title}
                message={dialogContent.message}
                confirmText={dialogContent.confirmText}      // Pass dynamic text
                confirmButtonColor={dialogContent.confirmColor} // Pass dynamic color
            />
        </div>
    );
}