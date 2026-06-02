import { redirect } from 'next/navigation';

export default function CourseIntroAdminPageRedirect() {
  redirect('/admin/courses?tab=intro');
}
