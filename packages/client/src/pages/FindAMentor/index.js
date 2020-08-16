import React from 'react';
import MentorRequestFrame from './MentorRequestFrame.js';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

// Purpose:
//      Display a list of available mentors to parents and send mentorship requests.
// Visibility:
//      Authentication required.

const FindAMentorPage = () => {
    // Semantic breakdown:
    //     There are two main subcomponents: A column with filters and column displaying
    //     the mentor results. The tags set by the user should propagate to the mentorship
    //     column - the only shared state component.

    // const mentors = get('/api/mentors', { tags: tags, subjects: subjects });
    const mentors = [
        {
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            pronouns: 'he/him',
            college: 'Harvard Class of 2023',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80',
            bio: 'This is a wonderful bio, right? Hello? Anyone there?',
            tags: ['ESL'],
            subjects: ['Math', 'Social Studies', 'Spanish', 'AP Psychology'],
            major: 'Psychology',
            gradeLevels: ['Elementary', 'Middle School', 'High School'],
            timezone: 'PST',
        },
        {
            name: 'Barbara Lee',
            email: 'barbaralee@gmail.com',
            pronouns: 'she/her',
            college: 'MIT Class of 2024',
            avatar: 'https://images.unsplash.com/photo-1522778147829-047360bdc7f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=658&q=80',
            bio: 'This is a wonderful bio, right? Hello? Anyone there?',
            tags: ['French'],
            subjects: ['Art', 'Biology', 'Photography'],
            major: 'Dentistry',
            gradeLevels: ['Elementary'],
            timezone: 'EST',
        }
    ];
    const MentorColumn = () => {
        // A grid of mentor components.
        return (
            mentors.map((mentor) =>
                (<Modal text={mentor.name} title={mentor.name} trigger={<Button> {mentor.name} </Button>}>
                    <MentorRequestFrame mentor={mentor}/>
                </Modal>))
        )
    }

    return (
            <div className="container">
                <div className="col-md-8">
                    <MentorColumn/>
                </div>
            </div>
    )
}


export default FindAMentorPage;