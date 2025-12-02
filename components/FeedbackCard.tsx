import React from 'react';
import { Feedback } from '../types';
import { Star, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface FeedbackCardProps {
  feedback: Feedback;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Feedback Analysis
        </h3>
        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
          <Star className="w-4 h-4 text-amber-400 fill-current" />
          <span className="font-bold text-indigo-300">{feedback.score}/10</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Critique
          </h4>
          <p className="text-slate-200 malayalam-text leading-relaxed">
            {feedback.critique}
          </p>
        </div>

        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-900/50">
          <h4 className="text-sm font-medium text-amber-400 mb-1 flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-amber-500" />
             Improvement Tip
          </h4>
          <p className="text-slate-200 malayalam-text">
            {feedback.improvementTip}
          </p>
        </div>

        {feedback.grammarCorrection && (
           <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/50 text-sm">
             <span className="font-semibold text-blue-400">Grammar Correction: </span>
             <span className="text-blue-200 malayalam-text">{feedback.grammarCorrection}</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackCard;