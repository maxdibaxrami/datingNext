// src/app/edit-profile/page.tsx
"use client";

import React, { useEffect, useState, useCallback, FC } from "react";
import { Section, Cell } from "@telegram-apps/telegram-ui";
import {
  User,
  Calendar,
  Ruler,
  FileText,
  MapPin,
  Globe,
  Coffee,
  BookOpen,
  Users,
  Heart,
  Search,
  Cross,
  Star,
  Eye,
  ChevronRight,
  ChevronLeft,
  AlarmSmoke,
  DogIcon,
  VenusAndMars,
} from "lucide-react";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { usePhotoStore } from "@/lib/stores/usePhotoStore";
import { Profile } from "@/type/profile";
import { UserImage } from "@/type/userImage";
import { DraggableImageGallery } from "@/components/ButtonListWithDraggableImages";
import { useLocale } from "next-intl";
import { useState as useStateHook } from "react";
import { ButtonListWithDraggableImagesContainer } from "@/components/ButtonListWithDraggableImagesContainer";
import { Page } from "@/components/Page";
import { useRouter } from 'next/navigation';

const translations: Record<string, string> = {
  "editProfile.title": "Edit Profile",
  "photos.label": "Photos",
  "photos.add": "Add Photo",
  "photo.confirmRemove": "Remove this photo?",
  "photo.uploadError": "Upload failed. Retry?",
  "basicInfo.section": "Basic Info",
  "bio.section": "Bio & Location",
  "lifestyle.section": "Lifestyle & Preferences",
  "settings.section": "Additional Settings",
  "field.name": "Name",
  "field.birthDate": "Birth Date",
  "field.gender": "Gender",
  "field.height": "Height (cm)",
  "field.country": "Country",
  "field.smoking": "Smoking",
  "field.drinking": "Drinking",
  "field.education": "Education",
  "field.children": "Children",
  "field.relationshipStatus": "Relationship Status",
  "field.lookingFor": "Looking For",
  "field.religion": "Religion",
  "field.zodiac": "Zodiac",
  "field.pets": "Pets",
  "field.isVisible": "Visible to Others",
  "toggle.on": "On",
  "toggle.off": "Off",
  "button.save": "Save",
  "button.cancel": "Cancel",
  "notSet": "Not set",
  "labelPremium": "Premium",
  "labelSettings": "Settings",
  "labelHelp": "Help & Support",
  "main": "Main Menu",
};

function t(key: string): string {
  return translations[key] || key;
}

function useDirection() {
  const activeLocale = useLocale() as string;
  const [isRtl, setIsRtl] = useStateHook<boolean>(
    ["ar", "fa"].includes(activeLocale)
  );

  useEffect(() => {
    setIsRtl(["ar", "fa"].includes(activeLocale));
  }, [activeLocale, setIsRtl]);

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);

  return isRtl;
}

function ChevronByDirection({ isRtl }: { isRtl: boolean }) {
  return isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />;
}

// Color map for each field's icon background
const iconBackgrounds: Record<string, string> = {
  "field.name": "#FFD700",
  "field.birthDate": "#87CEEB",
  "field.gender": "#FF69B4",
  "field.height": "#8A2BE2",
  "field.bio": "#20B2AA",
  "field.city": "#FF8C00",
  "field.country": "#00CED1",
  "field.smoking": "#A0522D",
  "field.drinking": "#8B0000",
  "field.education": "#2E8B57",
  "field.children": "#FF4500",
  "field.relationshipStatus": "#DC143C",
  "field.lookingFor": "#1E90FF",
  "field.religion": "#4B0082",
  "field.zodiac": "#FF1493",
  "field.pets": "#32CD32",
  "field.isVisible": "#4682B4",
};

const getIconForField = (fieldKey: string): React.ReactNode => {
  switch (fieldKey) {
    case "field.name":
      return <User size={20} color="#fff"/>;
    case "field.birthDate":
      return <Calendar size={20} color="#fff"/>;
    case "field.gender":
      return <VenusAndMars size={20} color="#fff"/>;
    case "field.height":
      return <Ruler size={20} color="#fff"/>;
    case "field.bio":
      return <FileText size={20} color="#fff"/>;
    case "field.city":
      return <MapPin size={20} color="#fff"/>;
    case "field.country":
      return <Globe size={20} color="#fff"/>;
    case "field.smoking":
      return <AlarmSmoke size={20} color="#fff"/>;
    case "field.drinking":
      return <Coffee size={20} color="#fff"/>;
    case "field.education":
      return <BookOpen size={20} color="#fff"/>;
    case "field.children":
      return <Users size={20} color="#fff"/>;
    case "field.relationshipStatus":
      return <Heart size={20} color="#fff"/>;
    case "field.lookingFor":
      return <Search size={20} color="#fff"/>;
    case "field.religion":
      return <Cross size={20} color="#fff"/>;
    case "field.zodiac":
      return <Star size={20} color="#fff"/>;
    case "field.pets":
      return <DogIcon size={20} color="#fff"/>;
    case "field.isVisible":
      return <Eye size={20} color="#fff"/>;
    default:
      return <ChevronRight size={20} color="#fff"/>;
  }
};

export default function EditProfilePage() {
  const isRtl = useDirection();
  const router = useRouter();

  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);

  const photos = usePhotoStore((state) => state.photos);
  const setPhotos = usePhotoStore((state) => state.setPhotos);

  const [localProfile, setLocalProfile] = useState<Profile | null>(profile);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleFieldChange = useCallback(
    async <K extends keyof Profile>(fieldName: K, newValue: Profile[K]) => {
      if (!localProfile) return;
      const oldValue = localProfile[fieldName];
      setLocalProfile({ ...localProfile, [fieldName]: newValue });

      try {
        // TODO: Persist via API:
        // await api.updateProfileField(localProfile.id, fieldName, newValue);
        setProfile({ ...(localProfile as Profile), [fieldName]: newValue });
      } catch (err) {
        console.error(err);
        setLocalProfile({ ...localProfile, [fieldName]: oldValue } as Profile);
        alert(t("photo.uploadError"));
      }
    },
    [localProfile, setProfile]
  );

  const handleItemClick = (index: number) => {
    console.log("Button index clicked:", index);
    // TODO: navigate or perform action
  };

  const handleUpdatePhoto = useCallback(
    (photoId: number) => {
      // TODO: open crop modal or update flow
      console.log("Update photo:", photoId);
    },
    []
  );

  const handleUploadPhoto = useCallback(
    async (slotIndex: number) => {
      setUploadLoading(true);
      // TODO: trigger file input or upload flow at this slot index
      console.log("Upload photo at slot:", slotIndex);
      // After finishing upload:
      // setUploadLoading(false);
    },
    []
  );

  if (!localProfile) {
    return (
      <div className="p-4">
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <Page back={true}>
      <div className="p-4">
      {/* Photos Section with Grid Layout */}
      <section className="mb-6">
        <ButtonListWithDraggableImagesContainer uploadLoading={false}/>
      </section>

      {/* Basic Info */}
      <Section header={t("basicInfo.section")}>
        <ListCell
          fieldKey="field.name"
          label={t("field.name")}
          value={localProfile.name || t("notSet")}
          onClick={() => {
            // TODO: Navigate to name editor
          }}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.birthDate"
          label={t("field.birthDate")}
          value={
            localProfile.birth_date
              ? new Date(localProfile.birth_date).toLocaleDateString()
              : t("notSet")
          }
          onClick={() =>
            handleFieldChange(
              "birth_date",
              prompt(
                "Enter Birth Date (YYYY-MM-DD):",
                localProfile.birth_date || ""
              ) || null
            )
          }
          isRtl={isRtl}
        />

         <ListCell
          fieldKey="field.bio"
          label={t("field.bio")}
          value={localProfile.bio || t("notSet")}
          onClick={() =>
            handleFieldChange(
              "bio",
              prompt("Enter Bio:", localProfile.bio || "") || ""
            )
          }
          isRtl={isRtl}
        />

        <ListCell
          fieldKey="field.gender"
          label={t("field.gender")}
          value={localProfile.gender || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/gender')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.height"
          label={t("field.height")}
          value={
            localProfile.height_cm !== null
              ? `${localProfile.height_cm} cm`
              : t("notSet")
          }
          onClick={() => router.push('/edit-profile/height')}
          isRtl={isRtl}
        />
      </Section>

      {/* Lifestyle & Preferences */}
      <Section header={t("lifestyle.section")}>
        <ListCell
          fieldKey="field.smoking"
          label={t("field.smoking")}
          value={localProfile.smoking || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/smoking')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.drinking"
          label={t("field.drinking")}
          value={localProfile.drinking || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/drinking')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.education"
          label={t("field.education")}
          value={localProfile.education || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/education')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.children"
          label={t("field.children")}
          value={localProfile.children || t("notSet")}
           onClick={() => router.push('/edit-profile/enum/children')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.relationshipStatus"
          label={t("field.relationshipStatus")}
          value={localProfile.relationship_status || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/relationship_status')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.lookingFor"
          label={t("field.lookingFor")}
          value={localProfile.looking_for || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/looking_for')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.religion"
          label={t("field.religion")}
          value={localProfile.religion || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/religion')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.zodiac"
          label={t("field.zodiac")}
          value={localProfile.zodiac || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/zodiac')}
          isRtl={isRtl}
        />
        <ListCell
          fieldKey="field.pets"
          label={t("field.pets")}
          value={localProfile.pets || t("notSet")}
          onClick={() => router.push('/edit-profile/enum/pets')}
          isRtl={isRtl}
        />
      </Section>
    </div>
    </Page>
  );
};


// ListCell Component
interface ListCellProps {
  fieldKey: string;
  label: string;
  value: string;
  onClick: () => void;
  isRtl: boolean;
}

const ListCell: FC<ListCellProps> = ({ fieldKey, label, value, onClick, isRtl }) => {
  const icon = getIconForField(fieldKey);
  const bgColor = iconBackgrounds[fieldKey] || "#E0E0E0";

  return (
    <Cell
      before={
        <div
          style={{
            backgroundColor: bgColor,
            borderRadius: 6,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      }
      after={<ChevronByDirection isRtl={isRtl} />}
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
    </Cell>
  );
};
