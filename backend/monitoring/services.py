import google.generativeai as genai
from django.conf import settings
import json
from PIL import Image
import io


class GeminiAIService:
    """Service for analyzing tree health using Gemini AI"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def analyze_tree_image(self, image_path):
        """
        Analyze a tree image to detect health issues
        
        Args:
            image_path: Path to the tree image file
            
        Returns:
            dict: Analysis results including health assessment, issues, and recommendations
        """
        try:
            # Load the image
            img = Image.open(image_path)
            
            # Prepare the prompt
            prompt = """
            You are an expert botanist and tree health analyst. Analyze this tree image and provide:
            
            1. Overall health assessment (choose one: healthy, stressed, diseased, critical, unknown)
            2. Confidence score (0-100) in your assessment
            3. List of detected issues (e.g., leaf discoloration, bark damage, pest infestation, drought stress, disease symptoms)
            4. Specific recommendations for conservation and treatment
            
            Provide your response in the following JSON format:
            {
                "health_assessment": "healthy|stressed|diseased|critical|unknown",
                "confidence_score": 85,
                "detected_issues": [
                    {
                        "issue": "Issue name",
                        "severity": "low|medium|high",
                        "description": "Detailed description"
                    }
                ],
                "recommendations": "Detailed recommendations for care and conservation"
            }
            
            Be thorough and specific in your analysis. If the image quality is poor or you cannot determine the tree's health, 
            set health_assessment to "unknown" and explain why in the recommendations.
            """
            
            # Generate content
            response = self.model.generate_content([prompt, img])
            
            # Parse the response
            result = self._parse_response(response.text)
            result['raw_response'] = response.text
            
            return result
            
        except Exception as e:
            return {
                'health_assessment': 'unknown',
                'confidence_score': 0,
                'detected_issues': [],
                'recommendations': f'Error analyzing image: {str(e)}',
                'raw_response': str(e)
            }
    
    def _parse_response(self, response_text):
        """Parse the Gemini API response to extract structured data"""
        try:
            # Try to extract JSON from markdown code blocks
            if '```json' in response_text:
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                json_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text.strip()
            
            # Parse JSON
            data = json.loads(json_text)
            
            # Validate and normalize the data
            return {
                'health_assessment': data.get('health_assessment', 'unknown'),
                'confidence_score': float(data.get('confidence_score', 0)),
                'detected_issues': data.get('detected_issues', []),
                'recommendations': data.get('recommendations', 'No recommendations provided.')
            }
            
        except json.JSONDecodeError:
            # Fallback parsing if JSON parsing fails
            return self._fallback_parse(response_text)
    
    def _fallback_parse(self, response_text):
        """Fallback parsing when JSON extraction fails"""
        # Simple text analysis to extract information
        health_keywords = {
            'healthy': ['healthy', 'good condition', 'thriving'],
            'stressed': ['stressed', 'showing signs', 'concerning'],
            'diseased': ['diseased', 'sick', 'infected', 'disease'],
            'critical': ['critical', 'severe', 'dying', 'emergency']
        }
        
        health_assessment = 'unknown'
        response_lower = response_text.lower()
        
        for status, keywords in health_keywords.items():
            if any(keyword in response_lower for keyword in keywords):
                health_assessment = status
                break
        
        return {
            'health_assessment': health_assessment,
            'confidence_score': 50,
            'detected_issues': [
                {
                    'issue': 'Analysis incomplete',
                    'severity': 'medium',
                    'description': 'Could not parse structured response'
                }
            ],
            'recommendations': response_text
        }
