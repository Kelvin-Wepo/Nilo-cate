import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReportPage() {
  const { treeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    report_type: 'health_check',
    title: '',
    description: '',
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [aiResults, setAiResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const data = { ...formData, tree: treeId };
      const response = await reportService.createReport(data);
      setReportId(response.id);
      alert('Report submitted successfully!');
      
      // Auto-analyze if image uploaded
      if (formData.image) {
        await handleAnalyze(response.id);
      }
    } catch (error) {
      alert('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzing(true);
    try {
      const results = await reportService.analyzeReport(id || reportId);
      setAiResults(results);
    } catch (error) {
      alert('AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-forest-green mb-8">Submit Tree Report</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <label className="block font-bold mb-2">Report Type</label>
          <select
            value={formData.report_type}
            onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-leaf-green"
          >
            <option value="health_check">Health Check</option>
            <option value="disease">Disease Report</option>
            <option value="damage">Physical Damage</option>
            <option value="threat">Threat Detected</option>
            <option value="fire">Fire Risk</option>
            <option value="clearing">Illegal Clearing</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-leaf-green"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-leaf-green"
            rows="4"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block font-bold mb-2">Photo (for AI Analysis)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            className="w-full px-4 py-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Upload a photo for automatic AI health analysis</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-leaf-green text-white py-3 rounded-lg hover:bg-forest-green transition disabled:bg-gray-400"
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      {aiResults && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-forest-green mb-4">🤖 AI Analysis Results</h2>
          
          <div className="mb-4">
            <span className="font-bold">Health Assessment: </span>
            <span className={`px-3 py-1 rounded ${
              aiResults.health_assessment === 'healthy' ? 'bg-green-100 text-green-600' :
              aiResults.health_assessment === 'stressed' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {aiResults.health_assessment}
            </span>
          </div>

          <div className="mb-4">
            <span className="font-bold">Confidence: </span>
            <span className="text-lg">{aiResults.confidence_score}%</span>
          </div>

          {aiResults.detected_issues && aiResults.detected_issues.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold mb-2">Detected Issues:</h3>
              <ul className="list-disc list-inside space-y-1">
                {aiResults.detected_issues.map((issue, index) => (
                  <li key={index}>{issue.issue} - {issue.description}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-bold mb-2">Recommendations:</h3>
            <p className="text-gray-700">{aiResults.recommendations}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
