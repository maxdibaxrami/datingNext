
/** Only send what the back-end cares about */
export function toSignupPayload(state: any) {
  const {
    images,
    ...rest                      // gender, name, dob, …
  } = state;

  return {
    ...rest,
    /** send an array of plain URLs (or any shape your API expects) */
    // ➜  or if your endpoint wants the four sizes:
    images: images.map(({ url_sm, url_md, url_lg }:any) => ({
       sm: url_sm,
       md: url_md,
       lg: url_lg,
     })),
  };
}
