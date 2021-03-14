import { QuestionCollection } from 'inquirer';

type UserAnswers = { userType: 'user' };
type OrganizationAnswers = {
  userType: 'organization';
  organizationName: string;
};

export type InitAnswers = (UserAnswers | OrganizationAnswers) & {
  projectName: string;
};

export const questions: QuestionCollection<InitAnswers> = [
  {
    name: 'userType',
    message: 'Are you an organization or a user?',
    type: 'list',
    choices: ['user', 'organization'],
    when(answers: Partial<InitAnswers>) {
      return !answers.userType;
    },
  },
  {
    name: 'organizationName',
    message: 'What is the name of your organization?',
    type: 'input',
    when(answers: Partial<InitAnswers>) {
      return answers.userType === 'organization' && !answers.organizationName;
    },
  },
  {
    name: 'projectName',
    message: 'The name of your project?',
    type: 'input',
    when(answers: Partial<InitAnswers>) {
      return !answers.projectName;
    },
  },
];
