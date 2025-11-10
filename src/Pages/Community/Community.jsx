import GroupCard from './GroupCard';
import "../../assets/styles/community.css";

export default function Community() {
    return (
        <div className="community-container">
            <GroupCard
                type="Project"
                icon="fa-briefcase"
                description="Collaborate on course assignments, research, or personal projects."
            />
            <GroupCard
                type="Club"
                icon="fa-users"
                description="Discover and join student-run clubs, from coding and design to music and sports."
            />
        </div>
    );
}