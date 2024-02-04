import React, { useEffect, useReducer, useState } from 'react';
import './App.css';
import logo from './logo.svg';
import { motion, AnimatePresence } from 'framer-motion';

const initialValues = {
    questions: [],
    answers: [],
    correctAnswers: [],
    status: 'pending',
    optionIndex: 0,
    timer: null,
    answer: null,
    points: 0
};

function reducer(state, action) {
    // Move the declaration of 'question' outside the switch statement
    let question;

    switch (action.type) {
        case 'fetchingData':
            return {
                ...state,
                questions: action.payload,
                status: 'fetchingData'
            };

        case 'displayingQuestions':
            const correctAnswersHandler = () => {
                return state.questions.map(question => question.correctOption);
            };

            return {
                ...state,
                status: 'displayingQuestions',
                questions: action.payload,
                timer: state.questions.length * 10,
                correctAnswers: correctAnswersHandler()
            };

        case 'checkingAnswer':
            // Move the declaration here
            question = state.questions[state.optionIndex];

            return {
                ...state,
                status: 'checkingAnswer',
                answer: action.payload,
                points:
                    action.payload === question.correctOption
                        ? state.points + question.points
                        : state.points,
                answers: [...state.answers, action.payload]
            };

        case 'nextQuestion':
            return {
                ...state,
                status: 'nextQuestion',
                optionIndex: state.optionIndex + 1,
                answer: null
            };

        case 'skipQuestion':
            question = state.questions[state.optionIndex]; // Declaration moved here

            return {
                ...state,
                status: 'skipQuestion',
                answer: action.payload, // Use 'skipped' to represent skipping
                answers: [...state.answers, action.payload]
            };

        case 'timerStarts':
            return {
                ...state,
                timer: state.timer - 1
            };

        case 'overTime':
            const updatedAnswers = [...state.answers];
            const assigningFalsyVal = () => {
                while (updatedAnswers.length < state.questions.length) {
                    updatedAnswers.push(action.payload);
                }

                return updatedAnswers;
            };

            return {
                ...state,
                optionIndex: state.questions.length + 1,
                answers: assigningFalsyVal()
            };

        case 'restart':
             return {
                ...state,
                status: 'restart',
                answers: [],
                optionIndex: 0,
                answer: null,
                points: 0,
                timer: state.questions.length * 10
            };
        case 'error':
            return {
                ...state,
                status: 'Error has occurred fetching data'
            };

        default:
            throw new Error('Action is unknown');
    }
}

function App() {
    const [showParam, setShowParam] = useState(false);
    const [results, setResults] = useState(false);
    const DataAPI = 'http://localhost:9000/questions';
    const [
        { questions, status, optionIndex, answer, points, timer, answers, correctAnswers },
        dispatch
    ] = useReducer(reducer, initialValues);

    const allPoints = questions.reduce((accumulator, question) => accumulator + question.points, 0);
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

    useEffect(() => {
        const timerInterval = setInterval(function () {
            dispatch({ type: 'timerStarts' });

            // Check if the time is up
            if (min < 0) {
                dispatch({ type: 'overTime', payload: QuestionsLength + 2 });
            }
        }, 1000);

        return () => {
            clearInterval(timerInterval);
        };
    }, [dispatch, min]);

    return (
        <div className=" p-2 h-screen bg-white-bg">
            <div className="grid grid-cols-3 gap-4 h-full">
                <div
                    className={`col-span-2 p-4 h-full rounded-md overflow-y-auto ${
                        status === 'fetchingData'
                            ? 'flex-col items-center justify-center'
                            : ' grid grid-rows-2 gap-3 '
                    }`}
                    style={{ gridTemplateRows: '1.5fr 3fr' }}
                >
                    {status === 'pending' && (
                        <motion.h1
                            key="pending"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'tween', duration: 0.5, delay: 0.3 }}
                        >
                            Loading Questions...
                        </motion.h1>
                    )}

                    {status === 'error' && <Error />}
                    {results ? (
                        <ResultsPage
                            questions={questions}
                            answers={answers}
                            correctAnswers={correctAnswers}
                            setResults={setResults}
                        />
                    ) : (
                        <>
                            {status === 'fetchingData' ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: 'tween', duration: 0.5, delay: 0.3 }}
                                        className="flex flex-col items-center justify-center h-full gap-3 -z-1"
                                    >
                                        <h1 className="text-3xl text-color-dark text-center ">
                                            Test your ReactJS knowledge with this {QuestionsLength}{' '}
                                            question quiz and see how well educated you are.
                                        </h1>
                                        <p>Also you will be timed 😁</p>
                                        <button
                                            className="start-btn p-4 bg-sky-blue text-grey hover:cursor-pointer hover:text-sky-blue
                                    hover:bg-white transition-all duration-5000 transform hover:scale-110 "
                                            style={{ borderRadius: '10px' }}
                                            onClick={() => {
                                                setShowParam(true);
                                                if (questions.length)
                                                    dispatch({
                                                        type: 'displayingQuestions',
                                                        payload: questions
                                                    });
                                            }}
                                        >
                                            Start the quiz
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <motion.div
                                    key="questions"
                                    initial={{ opacity: 0, x: -300 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'tween', duration: 0.5, delay: 0.3 }}
                                >
                                    <div
                                        className="grid grid-rows-2"
                                        style={{ borderRadius: '10px' }}
                                    >
                                        <div className="p-7 flex flex-col gap-2">
                                            <progress
                                                value={optionIndex }
                                                max={questions.length}
                                                className="h-2 w-full rounded bg-gray-200"
                                            />
                                            {showParam && (
                                                <>
                                                    <p className="text-xs text-grey">
                                                        {optionIndex === 15 ? 15 : optionIndex + 1}{' '}
                                                        / {QuestionsLength} questions
                                                    </p>

                                                    <p className="text-xs text-grey">
                                                        {points} / {allPoints} points
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center px-5">
                                            {questions.length > 0 ? (
                                                status === 'fetchingData' ? (
                                                    <h1 className="text-3xl text-color-dark">
                                                        {' '}
                                                        Test your ReactJS knowledge with this
                                                        {QuestionsLength} questions quiz and see how
                                                        well educated you are.
                                                    </h1>
                                                ) : (
                                                    <h1 className="text-4xl text-color-dark">
                                                        {questions[optionIndex]?.question}
                                                    </h1>
                                                )
                                            ) : (
                                                <p>Loading question...</p>
                                            )}
                                        </div>
                                    </div>
                                    {optionIndex < QuestionsLength ? (
                                        <>
                                            <div
                                                className="grid grid-rows-2"
                                                style={{
                                                    borderRadius: '10px',
                                                    gridTemplateRows: '1fr .3fr'
                                                }}
                                            >
                                                <div className="p-4">
                                                    {status !== 'fetchingData' && (
                                                        <>
                                                            <div
                                                                className="bg-white h-full w-full grid grid-cols-4 p-4 py-4 gap-2"
                                                                style={{ borderRadius: '10px' }}
                                                            >
                                                                {status !== 'fetchingData' && (
                                                                    <>
                                                                        {questions.length &&
                                                                            questions[
                                                                                optionIndex
                                                                            ]?.options.map(
                                                                                (option, index) => (
                                                                                    <div
                                                                                        className={`flex justify-center self-center h-max bg-white-bg  ${
                                                                                            status !=
                                                                                                'checkingAnswer' &&
                                                                                            min >=
                                                                                                0 &&
                                                                                            'hover:bg-sky-blue transition-all duration-5000 transform hover:scale-110'
                                                                                        } `}
                                                                                        style={{
                                                                                            borderRadius:
                                                                                                '10px'
                                                                                        }}
                                                                                        key={index}
                                                                                    >
                                                                                        <button
                                                                                            className={`h-full w-full p-4 ${
                                                                                                answer !==
                                                                                                null
                                                                                                    ? index ===
                                                                                                      questions[
                                                                                                          optionIndex
                                                                                                      ]
                                                                                                          .correctOption
                                                                                                        ? 'bg-sky-blue h-full w-full '
                                                                                                        : 'bg-color-dark opacity-3 h-full w-full '
                                                                                                    : ''
                                                                                            }`}
                                                                                            style={{
                                                                                                borderRadius:
                                                                                                    '10px'
                                                                                            }}
                                                                                            disabled={
                                                                                                answer !==
                                                                                                null
                                                                                            }
                                                                                            onClick={() => {
                                                                                                {
                                                                                                    min >=
                                                                                                        0 &&
                                                                                                        dispatch(
                                                                                                            {
                                                                                                                type: 'checkingAnswer',
                                                                                                                payload:
                                                                                                                    index
                                                                                                            }
                                                                                                        );
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {option}
                                                                                        </button>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex justify-start items-center gap-3 p-4">
                                                    {status !== 'fetchingData' && min >= 0 && (
                                                        <>
                                                            {answer === null && (
                                                                <div>
                                                                    {optionIndex !== 15 && (
                                                                        <a
                                                                            className="p-4 border border-gray-200 border-solid px-8 hover:cursor-pointer hover:bg-sky-blue transition-all duration-300"
                                                                            style={{
                                                                                borderRadius: '10px'
                                                                            }}
                                                                            onClick={() => {
                                                                                dispatch({
                                                                                    type: 'skipQuestion',
                                                                                    payload:
                                                                                        questions.length +
                                                                                        2
                                                                                });
                                                                            }}
                                                                        >
                                                                            Skip
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {answer !== null && (
                                                                <>
                                                                    <div
                                                                        disabled={answer === null}
                                                                        onClick={() => {
                                                                            dispatch({
                                                                                type: 'nextQuestion'
                                                                            });
                                                                        }}
                                                                    >
                                                                        {optionIndex == 14 ? (
                                                                            <a
                                                                                className="bg-sky-blue p-4 px-8  hover:cursor-pointer"
                                                                                style={{
                                                                                    borderRadius:
                                                                                        '10px'
                                                                                }}
                                                                            >
                                                                                Finish
                                                                            </a>
                                                                        ) : (
                                                                            <a
                                                                                className="bg-sky-blue p-4 px-8  hover:cursor-pointer"
                                                                                style={{
                                                                                    borderRadius:
                                                                                        '10px'
                                                                                }}
                                                                            >
                                                                                {optionIndex === 14
                                                                                    ? 'Submit'
                                                                                    : 'Next'}
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {status !== 'fetchingData' && (
                                                        <div
                                                            className="p-4 border text-black border-solid px-8 bg-white"
                                                            style={{ borderRadius: '10px' }}
                                                        >
                                                            {min >= 0
                                                                ? `${min}:${
                                                                      seconds < 10
                                                                          ? '0' + seconds
                                                                          : seconds
                                                                  }`
                                                                : "Time's up"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center mb-12">
                                            <p
                                                className="bg-sky-blue p-5"
                                                style={{ borderRadius: '10px' }}
                                            >
                                                You got {points} out of {allPoints} points (
                                                {Math.ceil((points / allPoints) * 100)}%)
                                            </p>
                                            <button
                                                className="p-3.5 border border-gray-200 border-solid px-8 hover:cursor-pointer mt-3 text-sm
                                                hover:cursor-pointer mt-3 text-sm
                                        hover:bg-white transition-all duration-5000 transform hover:scale-110"
                                                style={{ borderRadius: '10px' }}
                                                onClick={() => {
                                                    setResults(true);
                                                }}
                                            >
                                                results
                                            </button>
                                            <button
                                                className="p-3.5 border border-gray-200 border-solid px-8 hover:cursor-pointer mt-3 text-sm
                                        hover:bg-white transition-all duration-5000 transform hover:scale-110"
                                                style={{ borderRadius: '10px' }}
                                                onClick={() => dispatch({ type: 'restart' })}
                                            >
                                                Restart The Quiz
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
                <motion.div
                    key="sidebar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'tween', duration: 0.5, delay: 0.6 }}
                    className="bg-gray-100 flex flex-col h-full justify-center items-center"
                    style={{ borderRadius: '10px' }}
                >
                    <div
                        className="bg-customGray text-white w-full h-full flex justify-center items-center flex-col"
                        style={{ borderRadius: '10px' }}
                    >
                        <img src={logo} alt="logo" />
                        <h2 className="text-4xl">ReactJS Quiz</h2>
                    </div>
                </motion.div>
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

function ResultsPage({ questions, answers, correctAnswers, setResults }) {
    return (
        <div className="relative bg-white w-full z-10 h-full" style={{ borderRadius: '10px' }}>
            <button
                className="absolute right-5 top-3"
                style={{ fontSize: '24px' }}
                onClick={() => setResults(false)}
            >
                &times;
            </button>
            <div className="bg-grey h-70v w-80v p-4 rounded-md">
                {questions.map((ques, index) => (
                    <div key={index} className="w-full h-full mb-2 flex">
                        <p className="text-black">{ques.question}</p>
                        {ques.options[answers[index]] === ques.options[correctAnswers[index]] ? (
                            <p>✅</p>
                        ) : (
                            <p>❌</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
