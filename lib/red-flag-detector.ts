// Red flag detection keywords and patterns
export const RED_FLAG_KEYWORDS = [
  // Physical violence indicators
  'hit', 'hits', 'hitting', 'punch', 'punched', 'slap', 'slapped', 'kick', 'kicked',
  'hurt', 'hurts', 'hurting', 'bruise', 'bruised', 'violence', 'violent',
  'abuse', 'abused', 'abusing', 'beat', 'beaten', 'beating',
  
  // Threats and intimidation
  'threaten', 'threatens', 'threatened', 'threatening', 'threat', 'threats',
  'scare', 'scared', 'scaring', 'intimidate', 'intimidated', 'intimidating',
  'afraid', 'fear', 'fearful', 'terrified', 'terror',
  
  // Control and manipulation
  'control', 'controls', 'controlling', 'controlled', 'manipulate', 'manipulated',
  'isolate', 'isolated', 'isolating', 'isolation', 'trapped', 'trap',
  'won\'t let me', 'doesn\'t let me', 'forbid', 'forbidden', 'not allowed',
  
  // Emotional abuse
  'worthless', 'stupid', 'useless', 'pathetic', 'disgusting', 'hate myself',
  'kill myself', 'suicide', 'suicidal', 'end it all', 'better off dead',
  
  // Financial abuse
  'money', 'financial', 'bank account', 'credit card', 'won\'t give me money',
  'controls money', 'financial control',
  
  // Sexual coercion
  'force', 'forced', 'forcing', 'against my will', 'didn\'t want to',
  'made me', 'pressured', 'pressure',
  
  // Substance abuse related
  'drugs', 'drinking problem', 'alcoholic', 'addiction', 'addicted',
  
  // Extreme emotional distress
  'unsafe', 'danger', 'dangerous', 'emergency', 'help me', 'save me'
];

// Patterns that might indicate red flags (regex patterns)
export const RED_FLAG_PATTERNS = [
  /won'?t let me (talk to|see|visit|call)/i,
  /doesn'?t (allow|let) me to/i,
  /makes me feel (worthless|stupid|afraid)/i,
  /threatens to (leave|hurt|kill)/i,
  /says (he|she)'?ll (hurt|leave|kill)/i,
  /controls? (what I|where I|who I)/i,
  /checks? my (phone|email|messages)/i,
  /follows? me (everywhere|around)/i,
];

export interface RedFlagResult {
  isRedFlag: boolean;
  triggerPhrase?: string;
  severity: 'low' | 'medium' | 'high';
  category: 'physical' | 'emotional' | 'control' | 'threats' | 'financial' | 'sexual' | 'substance' | 'distress' | 'none';
  recommendedAction: string;
}

export class RedFlagDetector {
  static detectRedFlags(text: string): RedFlagResult {
    const lowerText = text.toLowerCase();
    
    // Check for keyword matches
    for (const keyword of RED_FLAG_KEYWORDS) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return this.categorizeRedFlag(keyword, text);
      }
    }
    
    // Check for pattern matches
    for (const pattern of RED_FLAG_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        return this.categorizeRedFlag(match[0], text);
      }
    }
    
    return {
      isRedFlag: false,
      severity: 'low',
      category: 'none',
      recommendedAction: 'continue_conversation'
    };
  }
  
  private static categorizeRedFlag(triggerPhrase: string, fullText: string): RedFlagResult {
    const lowerTrigger = triggerPhrase.toLowerCase();
    
    // Physical violence - highest priority
    const physicalKeywords = ['hit', 'punch', 'slap', 'kick', 'hurt', 'bruise', 'violence', 'beat'];
    if (physicalKeywords.some(keyword => lowerTrigger.includes(keyword))) {
      return {
        isRedFlag: true,
        triggerPhrase,
        severity: 'high',
        category: 'physical',
        recommendedAction: 'immediate_resources'
      };
    }
    
    // Threats and intimidation
    const threatKeywords = ['threaten', 'threat', 'scare', 'intimidate', 'afraid', 'fear', 'terrified'];
    if (threatKeywords.some(keyword => lowerTrigger.includes(keyword))) {
      return {
        isRedFlag: true,
        triggerPhrase,
        severity: 'high',
        category: 'threats',
        recommendedAction: 'immediate_resources'
      };
    }
    
    // Suicidal ideation
    const suicidalKeywords = ['kill myself', 'suicide', 'suicidal', 'end it all', 'better off dead'];
    if (suicidalKeywords.some(keyword => lowerTrigger.includes(keyword))) {
      return {
        isRedFlag: true,
        triggerPhrase,
        severity: 'high',
        category: 'distress',
        recommendedAction: 'crisis_resources'
      };
    }
    
    // Control and manipulation
    const controlKeywords = ['control', 'manipulate', 'isolate', 'trapped', 'won\'t let', 'doesn\'t let', 'forbid'];
    if (controlKeywords.some(keyword => lowerTrigger.includes(keyword))) {
      return {
        isRedFlag: true,
        triggerPhrase,
        severity: 'medium',
        category: 'control',
        recommendedAction: 'support_resources'
      };
    }
    
    // Emotional abuse
    const emotionalKeywords = ['worthless', 'stupid', 'useless', 'pathetic', 'disgusting'];
    if (emotionalKeywords.some(keyword => lowerTrigger.includes(keyword))) {
      return {
        isRedFlag: true,
        triggerPhrase,
        severity: 'medium',
        category: 'emotional',
        recommendedAction: 'support_resources'
      };
    }
    
    // Default to medium severity for any other detected phrases
    return {
      isRedFlag: true,
      triggerPhrase,
      severity: 'medium',
      category: 'emotional',
      recommendedAction: 'support_resources'
    };
  }
}

// Safety resources
export const SAFETY_RESOURCES = {
  immediate: {
    title: "Immediate Help",
    description: "If you're in immediate danger, please contact emergency services.",
    resources: [
      {
        name: "Emergency Services",
        phone: "911",
        description: "For immediate danger"
      },
      {
        name: "National Domestic Violence Hotline",
        phone: "1-800-799-7233",
        website: "https://www.thehotline.org",
        description: "24/7 confidential support"
      },
      {
        name: "Crisis Text Line",
        phone: "Text HOME to 741741",
        description: "24/7 crisis support via text"
      }
    ]
  },
  
  crisis: {
    title: "Crisis Support",
    description: "If you're having thoughts of self-harm, please reach out for help.",
    resources: [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        description: "24/7 suicide prevention support"
      },
      {
        name: "Crisis Text Line",
        phone: "Text HOME to 741741",
        description: "24/7 crisis support via text"
      }
    ]
  },
  
  support: {
    title: "Support Resources",
    description: "You deserve support and understanding. These resources can help.",
    resources: [
      {
        name: "National Domestic Violence Hotline",
        phone: "1-800-799-7233",
        website: "https://www.thehotline.org",
        description: "Confidential support and resources"
      },
      {
        name: "RAINN National Sexual Assault Hotline",
        phone: "1-800-656-4673",
        website: "https://www.rainn.org",
        description: "Support for sexual assault survivors"
      },
      {
        name: "National Alliance on Mental Illness",
        phone: "1-800-950-6264",
        website: "https://www.nami.org",
        description: "Mental health support and resources"
      }
    ]
  }
};