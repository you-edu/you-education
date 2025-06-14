"use client"
import React from 'react';
import MindMap from '@/components/Mindmap';

const ChapterPage: React.FC = () => {
  const treeData = [
    {
      name: 'Root',
      children: [
        {
          name: 'Frontend',
          children: [
            { name: 'React', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
            { name: 'Vue', url: 'https://www.youtube.com/watch?v=qZXt1Aom3Cs' },
            { name: 'Svelte', url: 'https://www.youtube.com/watch?v=3TVy6GdtNuQ' },
          ],
        },
        {
          name: 'Backend',
          children: [
            { name: 'Node.js', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4' },
            { name: 'Django', url: 'https://www.youtube.com/watch?v=F5mRW0jo-U4' },
            { name: 'Rails', url: 'https://www.youtube.com/watch?v=fmyvWz5TUWg' },
          ],
        },
        {
          name: 'DevOps',
          children: [
            { name: 'Docker', url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI' },
            { name: 'Kubernetes', url: 'https://www.youtube.com/watch?v=X48VuDVv0do' },
            { name: 'CI/CD', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-2">
      <MindMap data={treeData} />
    </div>
  );
};

export default ChapterPage;


