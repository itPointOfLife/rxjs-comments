import React from 'react';
import { from, BehaviorSubject } from 'rxjs';
import { mergeMap, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

const searchSubject = new BehaviorSubject('');

const getCommentByStr = async (str) => {
  const comments = await fetch('https://jsonplaceholder.typicode.com/comments').then((res) =>
    res.json(),
  );
  return comments.filter((obj) => obj.body.includes(str));
};

const searchResultObservable = searchSubject.pipe(
  filter((val) => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap((val) => from(getCommentByStr(val))),
);

const useObservable = (observable, setter) => {
  React.useEffect(() => {
    let subscription = observable.subscribe((result) => {
      setter(result);
    });

    return () => subscription.unsubscribe();
  }, [observable, setter]);
};

function App() {
  const [search, setSearch] = React.useState('');
  const [results, setResults] = React.useState([]);

  useObservable(searchResultObservable, setResults);

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  };

  return (
    <div className="App">
      <input type="text" placeholder="Search" value={search} onChange={handleSearchChange} />
      {results.map((comment) => (
        <div key={comment.body}>{comment.body}</div>
      ))}
    </div>
  );
}

export default App;
