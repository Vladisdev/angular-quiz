import { Component, OnInit } from '@angular/core';
import { TestService } from '../../../shared/services/test.service';
import { QuizListType } from '../../../../types/quiz-list.type';
import { AuthService } from '../../../core/auth/auth.service';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { TestResultType } from '../../../../types/test-result.type';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent implements OnInit {
  quizzes: QuizListType[] = [];
  private testResult: TestResultType[] | null = null;

  constructor(
    private testService: TestService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.testService.getTests().subscribe((response: QuizListType[]) => {
      this.quizzes = response;
    });

    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.testService.getUserResults(userInfo.userId).subscribe((data) => {
        if (data) {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          const testResult = data as TestResultType[];
          if (testResult) {
            this.quizzes = this.quizzes.map((quiz: QuizListType) => {
              const foundItem: TestResultType | undefined = testResult?.find(
                (item: TestResultType) => item.testId === quiz.id
              );
              if (foundItem) {
                quiz.result = foundItem.score + '/' + foundItem.total;
              }

              return quiz;
            });
          }
        }
      });
    }
  }
}
