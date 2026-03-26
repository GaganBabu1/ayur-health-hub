import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AyurChatbotProps {
  initialContext?: string;
}

// Comprehensive knowledge base with varied responses
const ayurvedaKnowledgeBase: {
  [key: string]: {
    keywords: string[];
    responses: string[];
  };
} = {
  fever: {
    keywords: ['fever', 'temperature', 'hot', 'burning'],
    responses: [
      `In Ayurveda, fever (known as "Jwara") is often seen as the body's way of fighting imbalance, usually related to increased Pitta dosha.

🌡️ **Management approaches:**
• Drink warm herbal teas (avoid very hot)
• Stay hydrated with coconut water or herbal infusions
• Rest in a cool environment
• Light, digestible foods like khichdi
• Cooling herbs like neem and tulsi can be beneficial

⚠️ **Important:** High fever or prolonged symptoms require immediate medical attention. Please consult a doctor if fever persists.`,

      `Fever indicates your body is working to restore balance. In Ayurveda, we view this through the lens of doshas.

💊 **Natural support:**
• Sip warm water with lemon and honey
• Include turmeric and ginger in your diet
• Use cooling spices like coriander
• Get adequate rest (this is crucial)
• Avoid heavy, oily foods

🏥 **When to seek help:** If fever exceeds 102°F (39°C) or lasts more than 3 days, consult a healthcare professional immediately.`,
    ],
  },
  cold: {
    keywords: ['cold', 'congestion', 'runny nose', 'sniffles'],
    responses: [
      `A common cold is typically a Vata-Kapha imbalance in Ayurveda. Here's how you can support recovery:

🛡️ **Natural remedies:**
• Gargle with salt water
• Use neti pot for nasal cleansing
• Drink ginger-lemon-honey tea
• Steam inhalation with eucalyptus
• Avoid dairy and cold foods
• Keep warm and get rest

📌 **Duration:** Most colds resolve in 7-10 days. If symptoms worsen or include fever, consult a doctor.`,

      `Colds are your body's signal that immunity needs support. Ayurvedic care can help:

✨ **Daily practices:**
• Take a warm shower to open nasal passages
• Drink warm broths and soups
• Use sesame oil for nose massage (nasya)
• Practice gentle yoga or stretching
• Avoid stressful activities
• Get 8+ hours of sleep

Remember: Prevention is better than cure. Regular self-care practices (Dinacharya) strengthen immunity!`,
    ],
  },
  cough: {
    keywords: ['cough', 'throat', 'dry cough', 'persistent cough'],
    responses: [
      `Coughs in Ayurveda are often due to Vata or Kapha imbalance affecting the respiratory system.

💨 **Soothing approaches:**
• Honey and lemon in warm water (not for children under 1 year)
• Tulsi (holy basil) tea
• Avoid cold, dry foods
• Include warming spices: ginger, pepper, cloves
• Stay hydrated
• Avoid irritants like smoke and dust

⏰ **When to worry:** Persistent cough lasting more than 2 weeks needs medical evaluation.`,

      `A cough is your body's way of clearing the respiratory tract. Support it naturally:

🌿 **Herbal support:**
• Ginger and turmeric paste
• Licorice root tea
• Sesame oil massage on chest
• Warm milk with spices before bed
• Honey spoon (by itself)
• Avoid dairy if the cough is wet

Coughs from colds usually clear within a week. Chronic coughs need professional attention.`,
    ],
  },
  diet: {
    keywords: ['diet', 'food', 'eat', 'nutrition', 'eating'],
    responses: [
      `Ayurvedic nutrition is personalized based on your unique constitution (Dosha). Here are universal principles:

🥗 **Golden rules of eating:**
• Eat warm, cooked foods when possible
• Include all 6 tastes: sweet, sour, salty, pungent, bitter, astringent
• Eat at consistent times daily
• Chew slowly and thoroughly (aim for 32 times per bite)
• Eat in a calm, peaceful environment
• Don't eat when emotionally upset
• Avoid snacking between meals

🍲 **Seasonal eating:** Adjust your diet with seasons. Lighter foods in summer, heavier in winter.`,

      `Good digestion is the foundation of health in Ayurveda. Follow these eating guidelines:

⏰ **Timing matters:**
• Largest meal at lunch (when digestive fire is strongest)
• Light breakfast and dinner
• 2-3 hours gap between meals
• Avoid eating after sunset when possible
• Drink water 30 minutes before eating

🌾 **Food quality:**
• Choose organic, seasonal, local foods
• Avoid processed and artificial foods
• Include healthy fats: ghee, sesame oil
• Eat fresh food (avoid leftovers)`,

      `In Ayurveda, food is medicine! Your diet should support your dosha balance.

✅ **Healthy eating practices:**
• Eat with gratitude and awareness
• Avoid TV or screens while eating
• Maintain proper food combining
• Include vegetables, grains, and proteins
• Limit stimulating foods: caffeine, spicy, fried
• Stay well-hydrated throughout the day

For personalized diet recommendations, consult an Ayurvedic nutritionist based on your dosha type.`,
    ],
  },
  herbs: {
    keywords: ['herb', 'herbal', 'ginger', 'tulsi', 'ashwagandha', 'neem', 'turmeric'],
    responses: [
      `Ayurvedic herbs are nature's pharmacy! Here are popular ones and their benefits:

🌿 **Common Ayurvedic herbs:**
• **Turmeric**: Anti-inflammatory, supports joints and skin
• **Ginger**: Aids digestion, reduces inflammation
• **Tulsi**: Boosts immunity, reduces stress
• **Ashwagandha**: Rejuvenating, supports energy and calm
• **Neem**: Purifying, supports skin health
• **Brahmi**: Enhances memory and concentration

💡 **How to use:** Teas, powders, oils, or supplements. Always consult before use, especially with medications.`,

      `Herbs are integral to Ayurvedic healing. Here's a quick guide:

🌱 **Herb properties:**
• **Ginger**: Warms digestion, reduces pain, anti-inflammatory
• **Ashwagandha**: Adaptogen, calms nervous system, boosts vitality
• **Tulsi**: Purifies air and body, supports respiratory health
• **Turmeric**: Contains curcumin, powerful antioxidant
• **Brahmi**: Cooling, supports brain function
• **Neem**: Traditional immune support

🎯 **Best practices:** Use fresh when possible, store properly, start with small amounts.`,

      `Ayurvedic herbs offer specific healing properties. Here's what you should know:

📚 **Popular herbs and uses:**
• **Triphala**: Gentle detox, supports digestion
• **Guduchi**: Immune booster, fever support
• **Shatavari**: Women's health, rejuvenation
• **Brahmi**: Mental clarity, cooling
• **Bacopa**: Cognitive support, stress relief
• **Licorice**: Sweet tonic, respiratory support

⚠️ **Important:** Herbs interact with medications. Get professional guidance for dosage and compatibility.`,
    ],
  },
  stress: {
    keywords: ['stress', 'anxiety', 'worried', 'overwhelmed', 'anxious'],
    responses: [
      `Stress deeply impacts your doshas in Ayurveda. Here's how to manage it naturally:

🧘 **Mind-calming practices:**
• Meditation (even 5 minutes daily helps)
• Pranayama (breathing exercises)
• Yoga, especially gentle stretching
• Abhyanga (self-massage with warm oil)
• Spend time in nature
• Practice gratitude
• Limit sensory overstimulation

🌙 **Evening routine:** Warm oil massage, herbal tea, early bedtime support stress relief.`,

      `Anxiety often stems from Vata imbalance. Ground yourself with these practices:

🌍 **Grounding techniques:**
• Barefoot walking on earth or grass
• Warm oil massage on feet and hands
• Consistent daily routine
• Warm, nourishing foods
• Reduce caffeine and stimulants
• Practice deep breathing (Nadi Shodhana)
• Maintain regular sleep schedule

🎵 **Calming activities:** Music, journaling, cooking, gardening support mental peace.`,

      `Mental peace is achievable through Ayurvedic lifestyle practices:

💚 **Stress management tools:**
• Start meditation (apps can help)
• Practice Yoga Nidra (guided relaxation)
• Herbal support: ashwagandha, brahmi, jatamansi
• Aromatherapy: lavender, sandalwood
• Journaling your thoughts
• Speaking with trusted friends or therapists
• Setting healthy boundaries

Remember: It's okay to seek professional mental health support when needed!`,
    ],
  },
  sleep: {
    keywords: ['sleep', 'insomnia', 'sleepless', 'tired', 'rest', 'fatigue'],
    responses: [
      `Good sleep is the foundation of health in Ayurveda. Create the right conditions:

🌙 **Better sleep habits:**
• Consistent bedtime (ideally 10 PM)
• Consistent wake time (ideally 6 AM)
• Avoid screens 1 hour before bed
• Warm milk with spices (turmeric, nutmeg, cardamom)
• Warm bath or shower
• Light massage with warm oil
• Cool, dark, quiet bedroom

💤 **Ideal sleep duration:** 7-9 hours for optimal health.`,

      `Sleep issues often indicate nervous system imbalance. Support it naturally:

🛌 **Sleep-promoting routine:**
• Dim lights from sunset onwards
• Gentle stretching before bed
• Herbal tea: chamomile, passionflower, valerian
• Avoid stimulating foods: caffeine, sugar, spicy
• Journal worries before bed (clear your mind)
• Practice relaxation techniques
• Avoid naps (unless very short)

📱 **Tech-free zone:** Bedrooms should be for sleep and intimacy only.`,

      `Insomnia can be addressed through Ayurvedic principles:

⏲️ **Sleep optimization:**
• Establish Circadian rhythm alignment
• Eat dinner by 7 PM (light meals)
• Abhyanga (oil massage) on feet
• Nasya (oil in nose) before bed
• Herbal supplements: Ashwagandha, Brahmi
• Meditation or Yoga Nidra
• Avoid exercising close to bedtime

🌟 **Recovery:** Sleep debt accumulates. Consistent sleep schedule rebuilds your health!`,
    ],
  },
  exercise: {
    keywords: ['exercise', 'yoga', 'workout', 'fitness', 'physical activity'],
    responses: [
      `Ayurveda advocates exercise suited to your constitution and current condition:

🏃 **Exercise principles:**
• Exercise to 50% of your capacity (don't overdo it)
• Morning exercise is ideal
• Choose activities you enjoy
• Avoid exercising when ill or very tired
• Cool down with stretching
• Hydrate well before and after
• Match intensity to your dosha

🧘 **Yoga benefits:** Balances doshas, increases flexibility, calms mind, improves energy.`,

      `Physical activity is essential for health, but it must be balanced:

⚡ **Smart exercise:**
• Start gradually if new to exercise
• Include strength, flexibility, and cardio
• Respect your body's signals
• Exercise preferably in morning
• Avoid strenuous exercise in extreme heat
• Regular practice (3-5 days/week) is better than intense spurts
• Include yoga for holistic benefits

💪 **Recovery:** Rest is when your body actually builds strength. Don't skip it!`,

      `Movement is medicine in Ayurveda. Here's the right approach:

🌅 **Optimal exercise time:** Early morning (5-6 AM) when Vata is balanced
✨ **Types to consider:** Walking, swimming, yoga, dancing, cycling
⏱️ **Duration:** 30-60 minutes depending on your fitness level
🔄 **Frequency:** 5-6 days per week with rest days

🎯 **Remember:** Consistency beats intensity. A daily 20-minute practice beats sporadic intense workouts!`,
    ],
  },
  wellness: {
    keywords: ['wellness', 'health', 'immune', 'immunity', 'prevent', 'prevention', 'healthy'],
    responses: [
      `Prevention is the best medicine in Ayurveda. Build immunity through daily practices:

🛡️ **Immunity boosters:**
• Regular seasonal cleansing (Panchakarma)
• Dinacharya (daily routine)
• Ritucharya (seasonal adjustments)
• Adequate sleep and rest
• Stress management
• Healthy digestion (key to immunity)
• Regular gentle exercise
• Meditation and mindfulness

🌿 **Immune herbs:** Ashwagandha, Brahmi, Tulsi, Ginger, Turmeric, Triphala`,

      `Optimal health comes from balancing your unique constitution (Dosha):

⚖️ **Dosha-based wellness:**
• Identify your Vata, Pitta, or Kapha dominance
• Eat foods that balance your dosha
• Choose activities that ground you
• Maintain consistent routines
• Adapt with seasons
• Honor your body's signals
• Seek preventive care, not reactive care

🌟 **Principle:** Small consistent actions (1% better daily) lead to major health transformation!`,

      `Wellness is a holistic practice combining body, mind, and spirit:

🧬 **Whole-person health:**
• Physical: Nutrition, exercise, sleep
• Mental: Meditation, learning, creative pursuits
• Emotional: Healthy relationships, joy, gratitude
• Spiritual: Purpose, mindfulness, connection to nature
• Social: Community, giving, helping others

💡 **Start small:** Pick one area to improve this week. Build from there. Small changes compound!`,
    ],
  },
};

// Intelligent bot response generator
const getBotReply = (message: string, initialContext: string = ''): string => {
  const lowerMessage = message.toLowerCase().trim();

  // Check for greeting
  if (
    lowerMessage.match(/^(hi|hello|hey|greetings|namaste)/i) ||
    lowerMessage === '?'
  ) {
    const greetings = [
      `Hello! 🙏 I'm Ayur-Bot, here to share Ayurvedic wisdom. What would you like to know about?`,
      `Namaste! 🌿 How can I assist you with your health and wellness journey today?`,
      `Welcome back! 👋 What health or wellness topic interests you?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Check for thanks/appreciation
  if (
    lowerMessage.match(/^(thanks|thank you|appreciate|helpful|nice|good|great)/i)
  ) {
    const responses = [
      `You're very welcome! 🙏 Feel free to ask anytime. Remember: consistency in practice is key!`,
      `Happy to help! 😊 Wishing you health and happiness on your wellness journey.`,
      `Glad I could assist! 💚 Take care of yourself, and feel free to return with more questions.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Search through knowledge base
  for (const [topic, data] of Object.entries(ayurvedaKnowledgeBase)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      // Return a random response from the available ones
      return data.responses[Math.floor(Math.random() * data.responses.length)];
    }
  }

  // Fallback for unrecognized topics
  const fallbackResponses = [
    `That's a great question! 🤔 While I don't have specific information on that topic, here's what I can share:

In Ayurveda, most health concerns relate to **dosha imbalance** (Vata, Pitta, or Kapha). 

For personalized guidance on your specific question, I recommend:
• Consulting a qualified Ayurvedic practitioner
• Reading Ayurvedic texts or reputable resources
• Exploring our Knowledge Base section

Is there anything else about general wellness I can help with?`,

    `Interesting question! 🌟 While I'm knowledgeable about general Ayurvedic principles, specific medical concerns deserve professional attention.

**What you can explore:**
• Your unique dosha type
• Daily wellness practices (Dinacharya)
• Seasonal adjustments (Ritucharya)
• Herbal support for general health
• Stress management techniques
• Yoga and exercise

Would you like to know more about any of these areas?`,

    `That's wonderful that you're curious! 💡 Ayurveda is a vast science with thousands of years of wisdom.

**I can help with:**
✓ General health and wellness
✓ Common concerns (colds, stress, sleep)
✓ Herbal information
✓ Lifestyle practices
✓ Nutrition basics

For very specific or serious health issues, please see a healthcare professional.

What would you like to explore?`,
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

const AyurChatbot: React.FC<AyurChatbotProps> = ({ initialContext = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! 👋 I'm Ayur-Bot, your Ayurvedic wellness assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (): void => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate slight delay for bot response
    setTimeout(() => {
      const botReply = getBotReply(inputValue, initialContext);
      const botMessage = {
        id: messages.length + 2,
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Panel */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-96 max-w-[calc(100vw-2rem)] h-[32rem] flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Ayur-Bot Assistant</CardTitle>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-600 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.sender === 'user'
                          ? 'text-green-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-3 flex gap-2 flex-shrink-0 bg-white rounded-b-lg">
            <Input
              type="text"
              placeholder="Ask about health, herbs, diet..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Toggle chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default AyurChatbot;
