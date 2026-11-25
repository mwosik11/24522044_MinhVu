/**
 * Evidence photo dataset. See TASK_DECOMPOSITION.md §1.3 for the contract.
 * `id` is the stable key used in the URL (?photoId=...), React keys and file names.
 */

/** @type {ReadonlyArray<{ slug: 'scene'|'forensics'|'surveillance'|'documents', label: string }>} */
export const CATEGORIES = Object.freeze([
  { slug: 'scene', label: 'Crime scene' },
  { slug: 'forensics', label: 'Forensics' },
  { slug: 'surveillance', label: 'Surveillance' },
  { slug: 'documents', label: 'Documents' },
]);

const W = 800;
const H = 600;

const photo = (id, category, caseRef, title, capturedAt, location, description, alt) =>
  Object.freeze({
    id,
    caseRef,
    title,
    category,
    capturedAt,
    location,
    description,
    alt,
    src: `photos/${id}.svg`, // relative: prefixed with import.meta.env.BASE_URL at render
    width: W,
    height: H,
  });

export const PHOTOS = Object.freeze([
  photo('ev-01', 'scene', 'CASE-2026-014', 'Living room floor plan', '2026-10-02T08:15:00+07:00', 'District 1, Ho Chi Minh City',
    'Four evidence locations marked with numbered triangular flags 1–4.',
    'Top-down floor plan of a room with four yellow marker flags numbered 1 to 4.'),
  photo('ev-02', 'scene', 'CASE-2026-014', 'Rear emergency exit', '2026-10-02T08:42:00+07:00', 'District 1, Ho Chi Minh City',
    'A dashed line traces the suspected escape route through the back door.',
    'Dark floor plan with furniture blocks and a dashed line running along the bottom.'),
  photo('ev-03', 'scene', 'CASE-2026-021', 'Basement parking lot', '2026-10-11T22:05:00+07:00', 'Thu Duc City',
    'Parking zone B2; flags mark where broken glass was found.',
    'Parking lot diagram with rectangular bays and four marker flags.'),
  photo('ev-04', 'forensics', 'CASE-2026-014', 'Fingerprint on door handle', '2026-10-02T10:30:00+07:00', 'Forensic Lab 2',
    'Whorl-pattern fingerprint lifted from the front door handle.',
    'Close-up of concentric blue ridges on a dark background, resembling a fingerprint.'),
  photo('ev-05', 'forensics', 'CASE-2026-021', 'Fabric fibre sample', '2026-10-12T09:10:00+07:00', 'Forensic Lab 1',
    'Blue synthetic fibre recovered near pillar B2-14.',
    'Interlocking dashed blue ellipses on a deep navy background.'),
  photo('ev-06', 'forensics', 'CASE-2026-033', 'Shoe print on wooden floor', '2026-10-20T14:00:00+07:00', 'Forensic Lab 2',
    'Size 42 shoe print with a wave-pattern sole.',
    'Repeating light-blue arc pattern imitating a shoe sole print.'),
  photo('ev-07', 'surveillance', 'CASE-2026-014', 'Lobby camera at 02:14', '2026-10-02T02:14:00+07:00', 'Apartment lobby',
    'A person wearing a cap enters the frame from the left.',
    'Green CCTV frame with a grid overlay, a REC indicator and a detection box around a person.'),
  photo('ev-08', 'surveillance', 'CASE-2026-021', 'B2 exit camera', '2026-10-11T21:58:00+07:00', 'Basement B2',
    'The suspect leaves the parking area 7 minutes before the alarm.',
    'CCTV frame with a person outlined by a green detection box.'),
  photo('ev-09', 'surveillance', 'CASE-2026-033', 'Side gate camera', '2026-10-19T23:40:00+07:00', 'Le Loi Street side gate',
    'The only frame captured before the camera lost signal.',
    'Security camera image with a coordinate grid, a red REC dot and a camera ID in the corner.'),
  photo('ev-10', 'documents', 'CASE-2026-014', 'Scene examination report', '2026-10-02T12:00:00+07:00', 'District 1 Police Station',
    'Page 1 of the report, bearing a cross-page seal.',
    'Slightly tilted sheet of paper with placeholder text lines and a round reddish-brown stamp.'),
  photo('ev-11', 'documents', 'CASE-2026-021', 'Parking receipt', '2026-10-11T19:32:00+07:00', 'Basement B2',
    'Motorbike parking receipt found in a jacket pocket.',
    'A sheet of paper on a beige background with ruled lines and a round stamp.'),
  photo('ev-12', 'documents', 'CASE-2026-033', 'Unsigned handwritten letter', '2026-10-20T08:20:00+07:00', 'Room 504',
    'Handwritten letter with no signature, on lined paper.',
    'Slightly tilted handwritten page with lines of varying length and a round stamp.'),
]);
