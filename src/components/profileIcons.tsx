import {
  User, Calendar, VenusAndMars, Ruler, FileText, MapPin, Globe,
  AlarmSmoke, Coffee, BookOpen, Users, Heart, Search, Cross,
  Star, Eye, Dog as DogIcon
} from 'lucide-react';
import React from 'react';

export function getIconForField(fieldKey: string): React.ReactNode {
  switch (fieldKey) {
    case 'field.name': return <User size={16} />;
    case 'field.birthDate': return <Calendar size={16} />;
    case 'field.gender': return <VenusAndMars size={16} />;
    case 'field.height': return <Ruler size={16} />;
    case 'field.bio': return <FileText size={16} />;
    case 'field.city': return <MapPin size={16} />;
    case 'field.country': return <Globe size={16} />;
    case 'field.smoking': return <AlarmSmoke size={16} />;
    case 'field.drinking': return <Coffee size={16} />;
    case 'field.education': return <BookOpen size={16} />;
    case 'field.children': return <Users size={16} />;
    case 'field.relationshipStatus': return <Heart size={16} />;
    case 'field.lookingFor': return <Search size={16} />;
    case 'field.zodiac': return <Star size={16} />;
    case 'field.pets': return <DogIcon size={16} />;
    case 'field.isVisible': return <Eye size={16} />;
    default: return null;
  }
}