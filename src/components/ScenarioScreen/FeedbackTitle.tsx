import { useTranslationStore } from '@/stores/translations'

interface Props {
  correct: boolean;
}

const FeedbackTitle = (props: Props) => {
  const { getText } = useTranslationStore()
  if (props.correct) {
    return (
      <h1 className="correct">
        {getText('feedback-correct')}
      </h1>
    )
  }
  return (
    <h1 className="wrong">
      {getText('feedback-wrong')}
    </h1>
  )
}

export default FeedbackTitle
