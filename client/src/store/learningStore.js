import { create } from 'zustand';

const getOrCreateUser = () => {
  let uid = localStorage.getItem('luminai_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('luminai_user_id', uid);
  }
  return uid;
};

const USER_ID = getOrCreateUser();
export const useLearningStore = create((set, get) => ({
  userId: USER_ID,
  subject: null,
  curriculum: null,
  masteryMap: {},
  mistakeHistory: {},
  interactions: [],
  preferredMode: 'simple',
  learningSpeed: 'moderate',
  activeTopic: null,
  activeTab: 'setup',
  messages: [],
  isLoading: false,
  awaitingAnswer: null,
  quizQuestions: null,
  curriculumProgress: 0,

  setSubject: (subject) => set({ subject }),
  setCurriculum: (curriculum) => set({ curriculum }),
  setActiveTopic: (topic) => set({ activeTopic: topic }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLoading: (isLoading) => set({ isLoading }),
  setAwaitingAnswer: (data) => set({ awaitingAnswer: data }),
  setQuizQuestions: (questions) => set({ quizQuestions: questions }),

  setProgress: (data) => set({
    masteryMap: data.masteryMap || {},
    mistakeHistory: data.mistakeHistory || {},
    interactions: data.interactions || [],
    preferredMode: data.preferredMode || 'simple',
    learningSpeed: data.learningSpeed || 'moderate',
    curriculumProgress: data.curriculumProgress || 0,
    subject: data.subject || get().subject,
    curriculum: data.curriculum || get().curriculum,
    activeTab: (data.curriculum && get().activeTab === 'setup') ? 'learn' : get().activeTab
  }),

  updateMastery: (topicId, newMastery) => set(state => ({
    masteryMap: { ...state.masteryMap, [topicId]: newMastery },
  })),

  addMessage: (msg) => set(state => ({
    messages: [...state.messages, { id: Date.now() + Math.random(), ...msg }],
  })),

  updateMessage: (id, patch) => set(state => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...patch } : m),
  })),

  clearMessages: () => set({ messages: [] }),
  setPreferredMode: (mode) => set({ preferredMode: mode }),
}));
