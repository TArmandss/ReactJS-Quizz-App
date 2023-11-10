import { useEffect, useReducer } from 'react';
import './App.css';
import logo from './logo.svg';


const initialValues = {
  questions: [],
  status: 'pending',
  optionIndex: 0,
  timer: null ,
  answer: null,
  points: 0,

};

function reducer(state, action) {
  switch (action.type) {
    case 'fetchingData':
      return {
        ...state,
        questions: action.payload,
        status: 'fetchingData',

      };
    case 'error':
      return {
        ...state,
        status: 'Error has occurred fetching data',
      };
    case 'displayingQuestions':
      return {
        ...state,
        status: 'displayingQuestions',
        questions: action.payload,
        timer: state.questions.length * 25,

      };
    case 'checkingAnswer':
      const question = state.questions[state.optionIndex];
      return {
        ...state,
        status: 'checkingAnswer',
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case 'nextQuestion':
      return {
        ...state,
        status: 'nextQuestion',
        optionIndex: state.optionIndex + 1,
        answer: null,
      };
    case "finished":
      return{
        ...state,
        status: "finished"
      }
       case "timerStarts":
      return{
        ...state,
        timer: state.timer - 1,
       
      }
      case "restart":
      return{
        ...state,
        status: "restart",
        optionIndex: 0,
        answer: null,
        points: 0,
      }
    default:
      throw new Error('Action is unknown');
  }
}

function App() {
  const DataAPI = 'http://localhost:9000/questions';
  const [{ questions, status, optionIndex, answer, points,timer }, dispatch] = useReducer(reducer, initialValues);

  const allPoints = questions.reduce(
    (accumulator, question) => accumulator + question.points,
    0
  );
 const QuestionsLength = questions.length;
  useEffect(() => {
    async function fetchingData() {
      try {
        const res = await fetch(DataAPI);
        const data = await res.json();
        dispatch({ type: 'fetchingData', payload: data });
      } catch (err) {
        dispatch({ type: 'error' });
      }
    }
    fetchingData();
  }, []);


  const min = Math.floor(timer / 60);
  const seconds = timer % 60;

  useEffect(()=>{
    
    const timer = setInterval(function(){
      dispatch({type: "timerStarts"})

    },1000)


    return () => {
      clearInterval(timer)
    }
    
  },[dispatch])

  console.log(min , seconds)
 
  return (
    <div className="p-2 h-screen bg-white-bg">
      {status === 'pending' && <h1>Loading Questions...</h1>}
      {status === 'error' && <Error />}

      <div className="grid grid-cols-3 gap-4 h-full">
        <div className="col-span-2 p-4 h-full rounded-md grid grid-rows-2 gap-3 overflow-y-auto" style={{ gridTemplateRows: '1.5fr 3fr' }}>
          <div className="grid grid-rows-2" style={{ borderRadius: '10px' }}>
            <div className="p-7 flex flex-col gap-2">
              <progress value={points} max={allPoints} className="h-1 h-2 rounded" />
              <p className="text-xs text-grey">
                {optionIndex + 1} of {QuestionsLength} questions
              </p>
              <p className="text-xs text-grey">
                {points} / {allPoints} points
              </p>
            </div>
            <div className="flex items-center px-5">
              {questions.length > 0 ? (
                 status === "fetchingData" ? (
                   <h1 className="text-3xl text-color-dark"> Test your ReactJS knowledge with this {QuestionsLength}-question quiz and see how well educated you are.</h1>
                 ) : (
                   <h1 className="text-4xl text-color-dark">{questions.at(optionIndex)?.question}</h1>
                     )
              ) : (
                 <p>Loading question...</p>
              )}
            </div>
          </div>
          {optionIndex < QuestionsLength ? (<>  

          <div className="grid grid-rows-2" style={{ borderRadius: '10px', gridTemplateRows: '1fr .3fr' }}>
            <div className="p-4">
              {status !== "fetchingData" && (<>
              
            
              <div className="bg-white h-full w-full grid grid-cols-4 p-4 py-4 gap-2" style={{ borderRadius: '10px' }}>
                {status !== 'fetchingData' && (
                  <>
                    {questions.length &&
                      questions[optionIndex]?.options.map((option, index) => (
                        <div className="flex justify-center self-center bg-white-bg h-full" style={{ borderRadius: '10px' }} key={index}>
                          <button
                            className={`h-full w-full ${
                              answer !== null
                                ? index === questions[optionIndex].correctOption
                                  ? 'bg-sky-blue h-full w-full'
                                  : 'bg-color-dark opacity-3 h-full w-full'
                                : ''
                            }`}
                            style={{ borderRadius: '10px' }}
                            disabled={answer !== null}
                            onClick={() => {
                              dispatch({ type: 'checkingAnswer', payload: index });
                            }}
                          >
                            {option}
                          </button>
                        </div>
                      ))}
                  </>
                )}
              </div>
                </>)}
            </div>
            <div className="flex justify-start items-center gap-3 p-4">
              {status !== 'fetchingData' && (
                <>
                  {answer === null && (
                    <div className="p-4 border border-gray-200 border-solid px-8 hover:cursor-pointer" style={{ borderRadius: '10px' }}>
                      Skip
                    </div>
                  )}
                  {answer !== null && (
                    <>
                      <div
                        className="p-4 px-8  hover:cursor-pointer"
                        style={{ borderRadius: '10px' }}
                        disabled={answer === null}
                        onClick={() => {
                          dispatch({ type: 'nextQuestion' });
                        }}
                      >
                        {optionIndex == 14 ? "Finish" : "Next"}
                      </div>
                    </>
                  )}
                </>
                
              )}
               {status !== 'fetchingData' && (
    <div className="p-4 border text-white border-gray-200 border-solid px-8 hover:cursor-pointer" style={{ borderRadius: '10px' }}>
                      {min}:{seconds}
                    </div>
                )}
          
              {status === 'fetchingData' && (
                <>
                  <div
                    className="start-btn p-4 px-8 bg-sky-blue text-grey hover:cursor-pointer"
                    style={{ borderRadius: '10px' }}
                    onClick={() => {
                      if (questions.length) dispatch({ type: 'displayingQuestions', payload: questions });
                    }}
                  >
                    Start the quiz
                  </div>
                </>
              )}
            </div>       
          </div>

          </>): (
          <div className='flex flex-col items-center justify-center mb-12'>
          <p className='bg-sky-blue p-5' style={{ borderRadius: '10px' }}>You got {points} out of {allPoints} points ({Math.ceil(points / allPoints * 100)}%)</p>
          <button className="p-3.5 border border-gray-200 border-solid px-8 hover:cursor-pointer mt-3 text-sm" 
          style={{ borderRadius: '10px' }} onClick={()=> dispatch({type: "restart"})}>
            Restart Quiz</button>
          </div>)}
          
        </div>
        <div className="bg-gray-100 flex flex-col h-full justify-center items-center" style={{ borderRadius: '10px' }}>
          <div className="bg-customGray text-white w-full h-full flex justify-center items-center flex-col" style={{ borderRadius: '10px' }}>
            <img src={logo} alt="logo" />
            <h2 className='text-4xl'>ReactJS Quiz</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function Error() {
  return (
    <div>
      <h1>Failed fetching the data. Be sure the server is running.</h1>
    </div>
  );
}

export default App;